POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
{
    "content": "Hello World"
}

HTTP/1.1 201

[Captures]
url: header "Location"
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.content" == "Hello World"
header "Content-Type" startsWith "application/json"