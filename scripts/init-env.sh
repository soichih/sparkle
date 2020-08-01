#!/usr/bin/env bash

ENV_FILE=".env"
PREFIX=$1

rm $ENV_FILE 2> /dev/null
touch $ENV_FILE

for VARIABLE in API_KEY APP_ID MEASUREMENT_ID BUCKET_URL PROJECT_ID STRIPE_PUBLISHABLE_KEY
do
  ENV_NAME="${PREFIX}${VARIABLE}"
  echo "REACT_APP_${VARIABLE}="${!ENV_NAME} >> ${ENV_FILE}
done
