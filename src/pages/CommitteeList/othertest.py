import json, pprint

with open('./original.json', 'r', encoding='utf8') as file:
    original = json.loads(file.read())
with open('./transliterated.json', 'r', encoding='utf8') as file:
    transliterated = json.loads(file.read())


offset = {}
for [key, value] in original.items():
    if value != transliterated[key]:
        offset[key] = value

pprint.pprint(offset)
