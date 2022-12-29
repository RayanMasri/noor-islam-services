import json

# abnormalities
# ahmad - ahmad dosary
# ahmad ahmad - dosary
# ahmad ahmad - - dosary
# - ahmad ahmad dosary
from deep_translator import GoogleTranslator

import mouse
import keyboard
file = open('./remove_later.json', 'r', encoding="utf8")
data = json.loads(file.read())
file.close()

data = list(map(lambda x: x["student-name"], data))
substrings = []

for name in data:
    abnormal = '-' in name
    
    if abnormal:
        splitted = name.split('-')
        splitted = list(filter(lambda e: e, map(lambda e: e.strip(), splitted)))
        name = ' '.join(splitted)

    substrings.append(name.split(' '))




translator = GoogleTranslator(source='ar', target='en')
def translate(string):
    #print(string)
    return translator.translate(string)

#print(substrings)
unique = []
substrings = [unique.append(item) for sublist in substrings for item in sublist if item not in unique]
names = {}
total = 0
import sys
for item in unique:
    #definite = item.startswith('ال')
    #print(item)
    #if definite:
        #pass
        #print(item)
        #print(f'al-{translate(item[2:])}')
        #print(item[2:])
        #print(item)
    
    
    #print()
    names[item] = translate(item)

    output = str(round(total / len(unique) * 100)) + '%'

    print(output)
    #sys.stdout.write('\033[2K\033[1G')
    #sys.stdout.write("\033[F")
    #sys.stdout.write('\r'+output)
    #sys.stdout.flush()
    total += 1
    #print(translate(item))
print(names)

