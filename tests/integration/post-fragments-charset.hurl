POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain; charset=utf-8
```This is a fragment!```

HTTP/1.1 201

[Captures]
url: header "Location"
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Length: 19
[Asserts]
body == "This is a fragment!"
header "Content-Type" == "text/plain; charset=utf-8"