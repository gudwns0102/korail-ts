import requests
import json
import base64

from Crypto.Util.Padding import pad
from Crypto.Cipher import AES

password = "Sejong3408!"

r = requests.post(
    "https://smart.letskorail.com:443/classes/com.korail.mobile.common.code.do",
    data={"code": "app.login.cphd"},
)

j = json.loads(r.text)

idx = "14"
key = "5225472e1223455b765f88f97b4bad57"

# self._idx = j['app.login.cphd']['idx']
# key = j["app.login.cphd"]["key"]

encrypt_key = key.encode(encoding="utf-8", errors="strict")
iv = key[:16].encode(encoding="utf-8", errors="strict")
cipher = AES.new(encrypt_key, AES.MODE_CBC, iv)

padded_data = pad(password.encode("utf-8"), AES.block_size)


answer = "MlRXelUvdldWdUxhRlk3MUQydWRlQT09"
print(
    "\nresult: %s\nanswer: %s\n"
    % (
        (base64.b64encode(cipher.encrypt(padded_data))),
        # base64.b64encode(base64.b64encode(cipher.encrypt(padded_data))).decode("utf-8"),
        answer,
    )
)
