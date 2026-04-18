import urllib.request, json

data = json.dumps({
    "commands": [
        {"command": "start", "description": "Botni boshlash"},
        {"command": "status", "description": "Obuna holati"},
        {"command": "oferta", "description": "Xizmat shartlari"},
        {"command": "help", "description": "Yordam"},
    ]
}).encode()

req = urllib.request.Request(
    "https://api.telegram.org/bot8678765504:AAEMaeGLXerTqpOm2bdd6jgcB8PZKCwCAjk/setMyCommands",
    data=data,
    headers={"Content-Type": "application/json"},
)
print(urllib.request.urlopen(req).read().decode())
