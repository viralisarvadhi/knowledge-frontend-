#!/bin/bash
if [ -n "$GOOGLE_SERVICES_JSON_BASE64" ]; then
  echo $GOOGLE_SERVICES_JSON_BASE64 | base64 --decode > google-services.json
  echo "google-services.json created from base64 secret"
else
  echo "GOOGLE_SERVICES_JSON_BASE64 secret not found"
fi
