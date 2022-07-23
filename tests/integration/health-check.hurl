GET http://localhost:8080
HTTP/1.1 200
Cache-Control: no-cache
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.author" isString
jsonpath "$.githubUrl" matches /^git@github.+/
jsonpath "$.version" matches /^\d+\.\d+\.\d+$/
