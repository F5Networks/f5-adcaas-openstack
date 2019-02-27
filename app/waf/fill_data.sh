#!/bin/bash

set -e

HOST="127.0.0.1:3000"
BIGIP=10.128.0.149
WEBSERVER=10.128.0.149
VIP=10.128.20.123

echo "Ping ..."
curl -s -X GET http://${HOST}/adcaas/v1/ping 


echo "Create ADC ... /adcaas/v1/adcs"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{
  "id": "1234",
  "name": "my-adc",
  "host": "'${BIGIP}'",
  "username": "admin",
  "passphrase": "admin"
}' http://${HOST}/adcaas/v1/adcs 

curl -s -X GET http://${HOST}/adcaas/v1/adcs 


echo "Create Tenant Association ... /adcaas/v1/tenantassocs"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{
  "tenantId": "default",
  "adcId": "1234"
}' http://${HOST}/adcaas/v1/tenantassocs 

curl -s -X GET http://${HOST}/adcaas/v1/tenantassocs 




echo "Create asm_demo wafpolicy.. /adcaas/v1/wafpolicy"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{
  "id":"12345678",
  "name": "asm_demo",
  "url":"http://10.145.106.100/asm-policy/Demo_asm_demo.xm"
}' http://${HOST}/adcaas/v1/wafpolicies 

echo "Create multi_policy wafpolicy.. /adcaas/v1/wafpolicy"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{
  "id": "23456789",
  "name": "multi_policy",
  "url": "http://10.145.106.100/asm-policy/Demo_multi_policy.xml"
}' http://${HOST}/adcaas/v1/wafpolicies 


echo "Create rules rule1 .. /adcaas/v1/rules"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{
    "id": "12345",
    "name":"Rule1",
    "default":false,
    "pattern":"/test1/",
    "wafpolicy":"12345678"
}' http://${HOST}/adcaas/v1/rules 


echo "Create rules rule2 .. /adcaas/v1/rules"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{  
    "id": "23456",
    "name":"Rule2",
    "default":false,
    "pattern":"/test2/",
    "wafpolicy":"23456789"
}' http://${HOST}/adcaas/v1/rules 


echo "Create rules rule3 .. /adcaas/v1/rules"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{  
    "id": "34567",
    "name":"Rule3",
    "default":true
}' http://${HOST}/adcaas/v1/rules 

echo "Create endpointpolicy .. /adcaas/v1/endpointpolicy"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{ 
    "name":"EndPointpolicy1",
    "rules":["12345","23456","34567"]
}' http://${HOST}/adcaas/v1/endpointpolicies 

ENDPOINT_POLICYID=$(curl -s -X GET http://${HOST}/adcaas/v1/endpointpolicies | grep EndPointpolicy1 | grep id | cut -f4 -d\")
echo "Create Service... /adcaas/v1/services"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{
  "id": "service123",
  "name": "my_service",
  "virtualAddresses": ["'${VIP}'"],
  "endpointpolicy":"'${ENDPOINT_POLICYID}'"
}' http://${HOST}/adcaas/v1/services 

curl -s -X GET http://${HOST}/adcaas/v1/services 

SERVICE_ID=$(curl -s -X GET http://${HOST}/adcaas/v1/services | grep id | cut -f4 -d\")

echo "Create Application... /adcaas/v1/applications"
curl -s -X POST -H 'Content-Type: application/json' -d \
'{
  "id":"abcd",
  "name": "my_app",
  "description": "my-app",
  "tenantId": "12345678",
  "services": ["'${SERVICE_ID}'"]
}' http://${HOST}/adcaas/v1/applications 
