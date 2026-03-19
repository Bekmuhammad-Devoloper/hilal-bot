#!/bin/bash
curl -s -X PATCH http://localhost:7777/api/users/1/admin -H "Content-Type: application/json" -d '{"isAdmin":true}'
echo ""
echo "Done!"
