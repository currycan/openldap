#! /bin/env bash

# DOMAIN="*.ansandy.com"
DOMAIN="*.ztaoz.com"
IP="10.177.140.16"
CERT_DIR="${PWD}/cert"
CLIENT_ID="ldap"

rm -rf ${CERT_DIR}
mkdir -p ${CERT_DIR}
cd ${CERT_DIR}

openssl genrsa -out ca.key 2048
openssl req -x509 -new -sha512 -days 3650 \
  -subj "/C=CN/ST=Shanghai/L=Shanghai/O=local/OU=Personal/CN=${DOMAIN}" \
  -key ca.key \
  -out ca.pem
openssl genrsa -out ${CLIENT_ID}.key 2048
openssl req -sha512 -new \
  -subj "/C=CN/ST=Shanghai/L=Shanghai/O=local/OU=Personal/CN=${DOMAIN}" \
  -key ${CLIENT_ID}.key \
  -out ${CLIENT_ID}.csr
cat >v3.ext <<-EOF
authorityKeyIdentifier = keyid,issuer:always
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
nsCertType = server
nsComment = "OpenSSL Generated Server Certificate"
subjectKeyIdentifier = hash
subjectAltName = @alt_names

[alt_names]
DNS.1=${DOMAIN}
DNS.2=${DOMAIN#*.}
DNS.3=ldap.${DOMAIN#*.}
IP.1 = 127.0.0.1
IP.2 = 0:0:0:0:0:0:0:1
IP.3 = 10.177.0.0/16
IP.4 = ${IP}
EOF
openssl x509 -req -sha512 -days 3650 \
  -extfile v3.ext \
  -CA ca.pem -CAkey ca.key -CAcreateserial \
  -in ${CLIENT_ID}.csr \
  -out ${CLIENT_ID}.pem

openssl verify -CAfile ca.pem ${CLIENT_ID}.pem
openssl x509 -noout -text -in ${CLIENT_ID}.pem
# # 验证当前套接字是否能通过CA的验证
# openssl s_client -connect ldap.${DOMAIN#*.}:636 -showcerts -state -CAfile ca.pem
