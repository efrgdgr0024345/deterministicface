"""Frozen CPU experiment: compatible CC0 mesh/eye assets, morphs and fixed hair.

This reference does not claim cross-machine conformance or completed photorealism.
No network, neural inference, global RNG, private key or human checkpoint.
"""
import hashlib
import array
import json
import math
import sys
import time
import struct
from pathlib import Path

import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ASSETS = Path(__file__).resolve().parent / 'assets'
spec_path = Path(sys.argv[sys.argv.index('--') + 1]).resolve()
spec = json.loads(spec_path.read_text())
if spec['profile'] != 'df-modular-cpu-exp-1' or spec['schema'] != 1:
    raise ValueError('Unsupported experimental profile')
if hashlib.sha256(Path(__file__).read_bytes()).hexdigest() != spec['rendererSource']:
    raise ValueError('Renderer source does not match scene specification')
settings, p = spec['render'], spec['values']
if settings['threads'] != 1 or settings['constructionThreads'] != 1:
    raise ValueError('This reference supports one construction/render thread only')
if bpy.app.version_string != settings['blender']:
    raise ValueError('Unsupported Blender version: ' + bpy.app.version_string)
manifest_bytes = (ASSETS / 'manifest.json').read_bytes()
if hashlib.sha256(manifest_bytes).hexdigest() != spec['assetManifest']:
    raise ValueError('Asset manifest mismatch')
for asset in json.loads(manifest_bytes)['assets']:
    data = (ASSETS / asset['file']).read_bytes()
    if len(data) != asset['bytes'] or hashlib.sha256(data).hexdigest() != asset['sha256']:
        raise ValueError('Asset checksum mismatch: ' + asset['file'])
started = time.monotonic()
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
if settings['cpuKernel'] != 'GENERIC' or settings['bvh'] != 'BVH2':
    raise ValueError('Unsupported CPU numerical backend')
scene.cycles.debug_use_cpu_avx2 = False
scene.cycles.debug_use_cpu_sse42 = False
scene.cycles.debug_bvh_layout = settings['bvh']
scene.cycles.debug_bvh_type = 'STATIC_BVH'
scene.cycles.debug_use_spatial_splits = False
import _cycles
_cycles.debug_flags_update(scene.as_pointer())
scene.cycles.samples = settings['samples']
scene.cycles.seed = settings['seed']
scene.cycles.use_animated_seed = False
scene.cycles.use_adaptive_sampling = False
scene.cycles.use_denoising = False
scene.render.threads_mode = 'FIXED'
scene.render.threads = settings['threads']
scene.render.resolution_x = settings['width']
scene.render.resolution_y = settings['height']
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.render.dither_intensity = settings['dither']
scene.view_settings.view_transform = settings['color']
scene.view_settings.look = settings['look']
scene.view_settings.exposure = 0
scene.view_settings.gamma = 1
scene.world = bpy.data.worlds.new('Fixed daylight')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.65, 0.8, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35


def obj_data(filename):
    vertices, uvs, faces, group = [], [], [], ''
    for line in (ASSETS / filename).read_text().splitlines():
        words = line.split()
        if not words:
            continue
        if words[0] == 'v':
            vertices.append(Vector(tuple(map(float, words[1:4]))))
        elif words[0] == 'vt':
            uvs.append(tuple(map(float, words[1:3])))
        elif words[0] == 'g':
            group = words[1]
        elif words[0] == 'f':
            faces.append((group, [tuple(int(n) - 1 for n in word.split('/')[:2]) for word in words[1:]]))
    return vertices, uvs, faces


base, uv, faces = obj_data('base.obj')
neutral = [v.copy() for v in base]


def morph(filename, strength):
    for line in (ASSETS / (filename + '.target')).read_text().splitlines():
        if line and not line.startswith('#'):
            words = line.split()
            if len(words) == 4:
                base[int(words[0])] += Vector(tuple(float(n) * strength for n in words[1:]))


morph(['head-oval', 'head-square', 'head-round'][p['head']], 0.55)
morph('head-scale-horiz-' + ('incr' if p['width'] >= 0 else 'decr'), abs(p['width']) / 100)
morph('mouth-scale-horiz-' + ('incr' if p['mouth'] >= 0 else 'decr'), abs(p['mouth']) / 100)
morph('mouth-upperlip-volume-incr', p['lips'] / 100)
morph('mouth-lowerlip-volume-incr', p['lips'] / 120)
morph('mouth-cupidsbow-incr', p['lips'] / 150)
morph('nose-scale-depth-' + ('incr' if p['nose'] >= 0 else 'decr'), abs(p['nose']) / 100)
morph('nose-scale-horiz-' + ('incr' if p['width'] >= 0 else 'decr'), abs(p['width']) / 140)
for side in ['l', 'r']:
    for section in [1, 2, 3]:
        morph(side + '-eye-height' + str(section) + '-incr', 0.35 + p['eyes'] / 100)
    morph(side + '-eye-corner1-up', p['eyes'] / 200)


def xyz(v):
    return (v.x, -v.z, v.y - 7.1)


rig = bpy.data.objects.new('One common head pose', None)
scene.collection.objects.link(rig)
rig.rotation_euler = (math.radians(p['pitch']), math.radians(p['roll']), math.radians(p['yaw']))


def mesh_object(name, vertices, selected, texcoords, material, parent=rig, subdivision=0):
    used = sorted({pair[0] for face in selected for pair in face})
    remap = {original: local for local, original in enumerate(used)}
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([xyz(vertices[i]) for i in used], [], [[remap[i] for i, _ in f] for f in selected])
    mesh.update()
    layer = mesh.uv_layers.new(name='Shared UV')
    for polygon, face in zip(mesh.polygons, selected):
        polygon.use_smooth = True
        for loop, (_, ti) in zip(polygon.loop_indices, face):
            layer.data[loop].uv = texcoords[ti]
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    obj.parent = parent
    mesh.materials.append(material)
    if subdivision:
        mod = obj.modifiers.new('Fixed subdivision', 'SUBSURF')
        mod.levels = mod.render_levels = subdivision
    return obj, used


def material(name, rgb, roughness=0.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes['Principled BSDF']
    shader.inputs['Base Color'].default_value = (*rgb, 1)
    shader.inputs['Roughness'].default_value = roughness
    return mat, shader


skin_colors = [(0.55, 0.32, 0.20), (0.43, 0.23, 0.14), (0.31, 0.15, 0.08),
               (0.19, 0.075, 0.035), (0.65, 0.39, 0.25)]
skin, shader = material('Continuous skin and lip surface', skin_colors[p['skin']], 0.46)
shader.inputs['Subsurface Weight'].default_value = 0.12
shader.inputs['Subsurface Radius'].default_value = (1, 0.45, 0.25)
shader.inputs['Subsurface Scale'].default_value = 0.065
nodes, links = skin.node_tree.nodes, skin.node_tree.links
attribute = nodes.new('ShaderNodeVertexColor')
attribute.layer_name = 'Skin tones'
links.new(attribute.outputs['Color'], shader.inputs['Base Color'])
noise = nodes.new('ShaderNodeTexNoise')
noise.inputs['Scale'].default_value = 170
noise.inputs['Detail'].default_value = 2
bump = nodes.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = 0.16
bump.inputs['Distance'].default_value = 0.008
links.new(noise.outputs['Fac'], bump.inputs['Height'])
links.new(bump.outputs['Normal'], shader.inputs['Normal'])
body_faces = [f for group, f in faces if group == 'body' and all(base[i].y > 4.4 for i, _ in f)]
head, used = mesh_object('Shared head neck shoulders', base, body_faces, uv, skin, subdivision=1)
colors = head.data.color_attributes.new(name='Skin tones', type='FLOAT_COLOR', domain='POINT')
tone = skin_colors[p['skin']]
for local, original in enumerate(used):
    v = neutral[original]
    lip = max(0, 1 - ((v.x / 0.29) ** 2 + ((v.y - 6.60) / 0.14) ** 2)) if v.z > 1.40 else 0
    blush = math.exp(-((abs(v.x) - 0.48) / 0.20) ** 2 - ((v.y - 6.95) / 0.3) ** 2) if v.z > 1 else 0
    target = (tone[0] * 0.78, tone[1] * 0.46, tone[2] * 0.55)
    rgb = [tone[c] * (1 - lip * 0.7) + target[c] * lip * 0.7 for c in range(3)]
    rgb[0] += blush * 0.025
    colors.data[local].color = (*rgb, 1)

# The supplied CC0 barycentric bindings fit the same morphing face template.
eye_vertices, eye_uv, eye_faces = obj_data('high-poly.obj')
bindings, in_vertices, scales = [], False, [1.0, 1.0, 1.0]
for line in (ASSETS / 'high-poly.mhclo').read_text().splitlines():
    words = line.split()
    if not words or words[0].startswith('#'):
        continue
    if words[0] in ['x_scale', 'y_scale', 'z_scale']:
        axis = 'xyz'.index(words[0][0])
        scales[axis] = abs(base[int(words[1])][axis] - base[int(words[2])][axis]) / float(words[3])
    elif words[0] == 'verts':
        in_vertices = True
    elif in_vertices and len(words) == 9:
        indices, weights, offset = list(map(int, words[:3])), list(map(float, words[3:6])), list(map(float, words[6:]))
        bindings.append(sum((base[i] * w for i, w in zip(indices, weights)), Vector()) +
                        Vector(tuple(offset[j] * scales[j] for j in range(3))))
    elif in_vertices:
        in_vertices = False
if len(bindings) != len(eye_vertices):
    raise ValueError('Eye bindings do not match geometry')
eyes, eye_shader = material('Compatible iris and sclera', (0.8, 0.8, 0.8), 0.21)
eye_texture = eyes.node_tree.nodes.new('ShaderNodeTexImage')
eye_texture.image = bpy.data.images.load(str(ASSETS / 'brown_eye.png'))
iris_tone = eyes.node_tree.nodes.new('ShaderNodeHueSaturation')
iris_tone.inputs['Hue'].default_value = 0.50 + p['iris'] / 200
iris_tone.inputs['Saturation'].default_value = 0.75
eyes.node_tree.links.new(eye_texture.outputs['Color'], iris_tone.inputs['Color'])
eyes.node_tree.links.new(iris_tone.outputs['Color'], eye_shader.inputs['Base Color'])
# The original texture's transparent atlas region belongs to the cornea.
# Treating its premultiplied RGB as opaque incorrectly renders black eye covers.
cornea = eyes.node_tree.nodes.new('ShaderNodeBsdfTransparent')
cornea.inputs['Color'].default_value = (1, 1, 1, 1)
eye_mix = eyes.node_tree.nodes.new('ShaderNodeMixShader')
eyes.node_tree.links.new(eye_texture.outputs['Alpha'], eye_mix.inputs[0])
eyes.node_tree.links.new(cornea.outputs[0], eye_mix.inputs[1])
eyes.node_tree.links.new(eye_shader.outputs[0], eye_mix.inputs[2])
eyes.node_tree.links.new(eye_mix.outputs[0], eyes.node_tree.nodes['Material Output'].inputs['Surface'])
for side in [-1, 1]:
    selected = [f for _, f in eye_faces if all(bindings[i].x * side > 0 for i, _ in f)]
    eye_obj, _ = mesh_object('Eye left' if side < 0 else 'Eye right', bindings, selected, eye_uv, eyes, subdivision=1)
    # Rotate each complete eyeball around its local centre, not the whole head.
    joint = 'joint-l-eye' if side > 0 else 'joint-r-eye'
    anchor_indices = sorted({i for group, face in faces if group == joint for i, _ in face})
    center = sum((Vector(xyz(base[i])) for i in anchor_indices), Vector()) / len(anchor_indices)
    for vertex in eye_obj.data.vertices:
        delta = vertex.co - center
        a = math.radians(p['gaze'])
        vertex.co = center + Vector((delta.x * math.cos(a) - delta.y * math.sin(a),
                                    delta.x * math.sin(a) + delta.y * math.cos(a), delta.z))


hair_colors = [(0.022, 0.012, 0.007), (0.06, 0.025, 0.012), (0.18, 0.08, 0.025),
               (0.35, 0.22, 0.09), (0.17, 0.16, 0.15)]
hair, _ = material('Fixed hair fibres', hair_colors[p['hairColor']], 0.4)
hair_nodes, hair_links = hair.node_tree.nodes, hair.node_tree.links
hair_noise = hair_nodes.new('ShaderNodeTexNoise')
hair_noise.inputs['Scale'].default_value = 120
hair_bump = hair_nodes.new('ShaderNodeBump')
hair_bump.inputs['Strength'].default_value = 0.25
hair_bump.inputs['Distance'].default_value = 0.006
hair_links.new(hair_noise.outputs['Fac'], hair_bump.inputs['Height'])
hair_links.new(hair_bump.outputs['Normal'], hair_nodes['Principled BSDF'].inputs['Normal'])


def curves_object(name, paths, radius, mat, parent=rig):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 3
    curve.bevel_depth = radius
    curve.bevel_resolution = 1
    for path in paths:
        spline = curve.splines.new('POLY')
        spline.points.add(len(path) - 1)
        for index, (point, width) in enumerate(path):
            spline.points[index].co = (*point, 1)
            spline.points[index].radius = width
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    obj.parent = parent
    curve.materials.append(mat)
    return obj


hair_bytes = bytes.fromhex(''.join(spec['hair']))
cursor = 0


def sample():
    global cursor
    if cursor + 2 > len(hair_bytes):
        raise ValueError('Hair expansion exhausted')
    value = int.from_bytes(hair_bytes[cursor:cursor + 2], 'big') / 65536
    cursor += 2
    return value


scalp = [face for group, face in faces if group == 'body' and
         all(base[i].y > 7.55 + max(0, base[i].z - 0.7) * 0.65 for i, _ in face)]
cap, _ = mesh_object('Compatible scalp coverage', base, scalp, uv, hair, subdivision=1)
for v in cap.data.vertices:
    v.co += (v.co - Vector((0, -0.55, 0.5))).normalized() * 0.014
paths = []
surface = BVHTree.FromPolygons([v.co for v in head.data.vertices],
                             [list(poly.vertices) for poly in head.data.polygons])
for strand in range(3200):
    face = scalp[int(sample() * len(scalp))]
    weights = [sample() + 0.1 for _ in face]
    root = sum((base[i] * w for (i, _), w in zip(face, weights)), Vector()) / sum(weights)
    theta = math.acos(max(-1, min(1, (root.y - 7.65) / 0.88)))
    phi = math.atan2(root.x, root.z - 0.55)
    length = 0.24 + sample() * (0.95 if p['hairStyle'] == 2 else 0.40)
    if abs(phi) < 0.8:
        length = min(length, 0.5)
    drift = (p['hairSweep'] / 100 * 0.38) + (sample() - 0.5) * 0.12
    wave = sample() * 2 * math.pi
    path = []
    for j in range(13):
        t = j / 12
        angle = theta + length * t
        azimuth = phi + drift * t
        radius = 1.025 + (0.03 if p['hairStyle'] == 1 else 0.012) * math.sin(wave + t * 10)
        point = Vector((0.79 * math.sin(angle) * math.sin(azimuth) * radius,
                        -(0.55 + 0.94 * math.sin(angle) * math.cos(azimuth) * radius),
                        0.55 + 0.88 * math.cos(angle) * radius))
        actual_root = Vector(xyz(root))
        ideal_root = Vector((0.79 * math.sin(theta) * math.sin(phi) * radius,
                             -(0.55 + 0.94 * math.sin(theta) * math.cos(phi) * radius),
                             0.55 + 0.88 * math.cos(theta) * radius))
        point += (actual_root - ideal_root) * (1 - t)
        nearest, normal, _, _ = surface.find_nearest(point)
        if nearest is not None:
            point = nearest + normal * (0.03 + 0.02 * t)
        path.append((point, 0.95 * (1 - t) + 0.15))
    paths.append(path)
curves_object('3200 baked head hair strands', paths, 0.0035, hair)
if p['hairStyle'] == 2:
    # Frozen loose locks fall from the crown across one cheek. They are part of
    # the public scene, not selected by or associated with a private checkpoint.
    locks = []
    side = -1 if p['hairSweep'] < 0 else 1
    for strand in range(36):
        spread = (sample() - 0.5) * 0.075
        path = []
        for j in range(21):
            t = j / 20
            point = Vector((side * (0.24 + 0.35 * t) + spread,
                            -1.40 - 0.12 * math.sin(math.pi * t), 0.95 - 1.55 * t))
            nearest, normal, _, _ = surface.find_nearest(point)
            point = nearest + normal * (0.045 + 0.025 * t)
            path.append((point, 1 - 0.8 * t))
        locks.append(path)
    curves_object('Frozen cheek-crossing loose locks', locks, 0.0027, hair)
for side in [-1, 1]:
    brow_paths = []
    for i in range(70):
        t = i / 69
        x = side * (0.16 + 0.4 * t)
        z = 0.40 + 0.10 * math.sin(t * math.pi)
        y = -1.49 + 0.10 * t
        brow_paths.append([(Vector((x, y, z)), 1), (Vector((x + side * 0.025, y - 0.015, z + 0.04)), 0.3)])
    curves_object('Compatible eyebrow fibres', brow_paths, 0.006, hair)


def sphere(name, location, scale, mat, parent=None):
    # BMesh's primitive operator can vary polygon adjacency/summation order,
    # producing different shading normals. Build explicit ordered topology.
    vertices = [(0, 0, 1), (0, 0, -1)]
    for ring in range(1, 8):
        theta = math.pi * ring / 8
        for segment in range(16):
            phi = 2 * math.pi * segment / 16
            vertices.append((math.sin(theta) * math.cos(phi), math.sin(theta) * math.sin(phi), math.cos(theta)))
    faces = [(0, 2 + i, 2 + (i + 1) % 16) for i in range(16)]
    for ring in range(6):
        a, b = 2 + ring * 16, 2 + (ring + 1) * 16
        faces.extend((a + i, b + i, b + (i + 1) % 16, a + (i + 1) % 16) for i in range(16))
    faces.extend((98 + i, 1, 98 + (i + 1) % 16) for i in range(16))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    obj.location, obj.scale, obj.parent = location, scale, parent
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


cloth, _ = material('Shoulder fabric', (0.045, 0.08, 0.095), 0.8)
garment_faces = [face for face in body_faces if all(base[i].y < 5.96 for i, _ in face)]
garment, _ = mesh_object('Garment fitted to common body', base, garment_faces, uv, cloth, subdivision=1)
for vertex in garment.data.vertices:
    vertex.co += vertex.normal * 0.025
bark, bark_shader = material('Landscape bark', (0.12 + p['bark'] / 2000, 0.065, 0.03), 0.85)
leaf, _ = material('Landscape foliage', (0.065, 0.13 + p['foliage'] / 1600, 0.04), 0.9)
stone, _ = material('Landscape stone', (0.25, 0.24, 0.19), 0.85)
land = bytes.fromhex(spec['landscape'])
for i in range(9):
    x = -3.2 + 6.4 * land[i * 5] / 255
    y = 1.8 + land[i * 5 + 1] / 130
    height = 1.3 + land[i * 5 + 2] / 80 + p['scene'] * 0.15
    width = 0.06 + land[i * 5 + 3] / 2500
    curves_object('Fixed landscape trunk', [[(Vector((x, y, -2)), 1.5),
                   (Vector((x + 0.12, y, height)), 0.5)]], width, bark, None)
    for j in range(4):
        direction = (-1 if j % 2 else 1)
        z = -0.1 + height * (j + 1) / 5
        endpoint = Vector((x + direction * (0.5 + land[80 + i * 4 + j] / 300), y, z + 0.4))
        curves_object('Fixed landscape branch', [[(Vector((x, y, z)), 1), (endpoint, 0.2)]], width * 0.7, bark, None)
        leaf_vertices, leaf_faces = [], []
        for k in range(35):
            a = 2 * math.pi * k / 35
            offset = Vector((math.cos(a) * 0.5, math.sin(a) * 0.3,
                             (land[(i * 80 + j * 35 + k) % len(land)] / 255 - 0.5) * 0.5))
            center = endpoint + offset
            axis = Vector((math.cos(a + 0.4), math.sin(a + 0.4), 0.3)) * 0.16
            cross = Vector((-axis.y, axis.x, 0)) * 0.32
            start = len(leaf_vertices)
            leaf_vertices.extend([center - axis, center + cross, center + axis, center - cross,
                                  center + Vector((0, 0, 0.025))])
            leaf_faces.extend([(start, start + 1, start + 4), (start + 1, start + 2, start + 4),
                               (start + 2, start + 3, start + 4), (start + 3, start, start + 4)])
        mesh = bpy.data.meshes.new('Fixed leaf cluster')
        mesh.from_pydata(leaf_vertices, [], leaf_faces)
        canopy = bpy.data.objects.new('Fixed leaf cluster', mesh)
        scene.collection.objects.link(canopy)
        mesh.materials.append(leaf)
for i in range(8):
    rock_height = 0.15 + land[240 + i] / 1000
    sphere('Near-contour rock', (-2.3 + land[200 + i] / 55, 1.0 + land[220 + i] / 150,
           -1.9 + rock_height), (0.20, 0.20, rock_height), stone)
ground, _ = material('Landscape ground', (0.17, 0.19, 0.105), 0.9)
sphere('Distant earth', (0, 4, -2.1), (30, 30, 0.2), ground)

camera_data = bpy.data.cameras.new('Fixed canonical portrait camera')
camera = bpy.data.objects.new('Fixed canonical portrait camera', camera_data)
scene.collection.objects.link(camera)
camera.location = (0, -9.5, 0.22)
target = Vector((0, -0.3, -0.05))
camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera_data.lens = 72
scene.camera = camera
light_data = bpy.data.lights.new('Common soft daylight', 'AREA')
light_data.energy, light_data.size = 650, 4
light = bpy.data.objects.new('Common soft daylight', light_data)
scene.collection.objects.link(light)
light.location = (-3 + p['light'] / 30, -4, 5)
light.rotation_euler = (-light.location).to_track_quat('-Z', 'Y').to_euler()
scene.render.filepath = str(spec_path.with_suffix('.png'))
bpy.context.view_layer.update()
geometry = hashlib.sha256()
geometry_parts = []
depsgraph = bpy.context.evaluated_depsgraph_get()
for obj in sorted(scene.objects, key=lambda item: item.name):
    if obj.type not in ['MESH', 'CURVE']:
        continue
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    geometry.update(obj.name.encode())
    positions, normals = hashlib.sha256(), hashlib.sha256()
    for vertex in mesh.vertices:
        geometry.update(struct.pack('<6f', *vertex.co, *vertex.normal))
        positions.update(struct.pack('<3f', *vertex.co))
        normals.update(struct.pack('<3f', *vertex.normal))
    geometry_parts.append({'name': obj.name, 'vertices': len(mesh.vertices),
                           'positions': positions.hexdigest(), 'normals': normals.hexdigest()})
    evaluated.to_mesh_clear()
spec_path.with_suffix('.geometry.json').write_text(json.dumps(geometry_parts, indent=2) + '\n')
if '--geometry-only' in sys.argv:
    print('GEOMETRY_DIAGNOSTIC_COMPLETED')
    sys.exit(0)
bpy.ops.render.render(write_still=True)
# Retain lossless linear floats to distinguish ray-render differences from
# display conversion/PNG differences during conformance diagnosis.
scene.render.image_settings.file_format = 'OPEN_EXR'
scene.render.image_settings.color_depth = '32'
scene.render.image_settings.exr_codec = 'ZIP'
exr_path = spec_path.with_suffix('.exr')
bpy.data.images['Render Result'].save_render(str(exr_path), scene=scene)
linear_image = bpy.data.images.load(str(exr_path), check_existing=False)
linear = array.array('f', [0]) * len(linear_image.pixels)
linear_image.pixels.foreach_get(linear)
spec_path.with_suffix('.f32').write_bytes(linear.tobytes())
result = {'profile': spec['profile'], 'publicKey': spec['publicKey'], 'digest': spec['digest'],
          'assetManifest': spec['assetManifest'], 'rendererSource': spec['rendererSource'],
          'yaw': p['yaw'], 'pitch': p['pitch'], 'gaze': p['gaze'], 'headFamily': p['head'],
          'hairStyle': p['hairStyle'], 'renderSeconds': time.monotonic() - started,
          'headVertices': len(head.data.vertices), 'hairStrands': 3200 + (36 if p['hairStyle'] == 2 else 0),
          'linearFloatSha256': hashlib.sha256(linear.tobytes()).hexdigest(),
          'geometrySha256': geometry.hexdigest(),
          'blender': bpy.app.version_string, 'settings': settings,
          'scope': 'Experimental modular human; realism and supported-target conformance require evaluation.'}
spec_path.with_suffix('.result.json').write_text(json.dumps(result, indent=2) + '\n')
print('MODULAR_PORTRAIT_COMPLETED')
