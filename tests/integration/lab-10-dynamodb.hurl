POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: application/json
{ "service": "DynamoDB" }

HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
jsonpath "$.fragment.ownerId" isString
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" startsWith "application/json"

[Captures]
first_url: header "Location"
first_id: jsonpath "$.fragment.id"
first_ownerId: jsonpath "$.fragment.ownerId"
first_created: jsonpath "$.fragment.created"
first_updated: jsonpath "$.fragment.updated"

GET {{first_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{first_id}}
jsonpath "$.fragment.ownerId" == {{first_ownerId}}
jsonpath "$.fragment.created" == {{first_created}}
jsonpath "$.fragment.updated" == {{first_updated}}
jsonpath "$.fragment.type" startsWith "application/json"

POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/markdown
```DynamoDB is **great**```

HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[A-Za-z0-9_-]+$"
jsonpath "$.fragment.ownerId" isString
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" startsWith "text/markdown"

[Captures]
second_url: header "Location"
second_id: jsonpath "$.fragment.id"
second_ownerId: jsonpath "$.fragment.ownerId"
second_created: jsonpath "$.fragment.created"
second_updated: jsonpath "$.fragment.updated"

GET {{second_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{second_id}}
jsonpath "$.fragment.ownerId" == {{second_ownerId}}
jsonpath "$.fragment.created" == {{second_created}}
jsonpath "$.fragment.updated" == {{second_updated}}
jsonpath "$.fragment.type" startsWith "text/markdown"

GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments[*]" contains "{{first_id}}"
jsonpath "$.fragments[*]" contains "{{second_id}}"

DELETE {{first_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200

GET {{first_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404

GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments[*]" contains "{{second_id}}"

DELETE {{second_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200

GET {{second_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 404