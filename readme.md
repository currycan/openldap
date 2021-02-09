# 说明

## 1. 证书申请

准备公网域名

## 1.1 安装 acme.sh

```bash
curl https://get.acme.sh | sh
alias acme.sh=~/.acme.sh/acme.sh
echo 'alias acme.sh=~/.acme.sh/acme.sh' >>/etc/profile
```

acme.sh 升级

```bash
acme.sh --upgrade
acme.sh  --upgrade  --auto-upgrade
```

生成证书后默认会自动续期，如需要强制更新：

```bash
acme.sh --cron -f
```

定时任务检测证书

## 1.2 腾讯云托管证书

使用腾讯的[dnsPod](dnspod.cn)托管证书, 依次打开 用户中心 -> 密钥管理 -> 创建密钥 (注意保存 token)

```bash
export DP_Id="你的ID"
export DP_Key="你的Token"
export DOMAIN="example.com"
acme.sh --issue --dns dns_dp -d ${DOMAIN} -d *.${DOMAIN}
```

## 1.3 阿里云托管证书

[阿里云证书申请](https://zhuanlan.zhihu.com/p/112300451)

[参考教程](https://developer.aliyun.com/article/692073)

获取 api 认证 token: [accessKey](https://ak-console.aliyun.com/#/accesskey)

```bash
export Ali_Key="ID"
export Ali_Secret="SECRET"
export DOMAIN="example.com"
acme.sh --issue --dns dns_ali -d ${DOMAIN} -d *.${DOMAIN}
```

TODO： 阿里云的好像有点问题，生成失败

## 1.4 证书安装

不建议直接用 ~/.acme.sh 下的证书，需要使用 --installcert 复制到指定目录。

```bash
export DOMAIN="example.com"
export CERT_PATH="certs"
mkdir -p ${CERT_PATH}
acme.sh --installcert --force -d ${DOMAIN} -d *.${DOMAIN} --key-file ${CERT_PATH}/${DOMAIN}.key --fullchain-file ${CERT_PATH}/${DOMAIN}.crt --ca-file ${CERT_PATH}/ca.crt
acme.sh --installcert --force -d ${DOMAIN} -d *.${DOMAIN} --key-file ${CERT_PATH}/${DOMAIN}-key.pem --fullchain-file ${CERT_PATH}/${DOMAIN}.pem --ca-file ${CERT_PATH}/ca.pem
```

在[ssl-test](ssl-test)中提供了测试证书的 demo 服务

## 2. LDAP

- LDAP（轻量级目录访问协议，Lightweight Directory Access Protocol)是为了实现目录服务的信息服务。
- 目录服务是一种特殊的数据库系统，其专门针对读取，浏览和搜索操作进行了特定的优化。在网络中应用了LDAP后，用户只需要使用一个账号和密码就可以轻松访问网络中的所有服务，实现用户身份的统一认证。
- 简单来说：拿LDAP来统一管理一些账号，例如: Gitlab,JenKins,Samba,SVN,Zabbix等。

## 2.1 关于SSL/TLS

- LDAP over SSL
  - LDAP over SSL 也就是 ldaps
  - ldap默认不加密情况下是走的389端口
  - 当使用ldaps的时候走的就是636端口了
  - 可以简单理解成http和https的关系
  - 当然ldaps已经淘汰了，不然也不会有LDAP over TLS出来

- LDAP over TLS
  - TLS可以简单理解为ldaps的升级
  - 它默认走389端口，但是会通讯的时候加密
  - 客户端连接LDAP时，需要指明通讯类型为TLS，所以他可以跟不加密的模式一样，任意端口都行

对比一下连接方式：

```bash
ldaps： ldapsearch -H ldaps://127.0.0.1:636
tls:   ldapsearch -ZZ -H ldap://127.0.0.1:389
```

LDAP目录服务是以明文的方式在网络中传输数据的（包括密码），这样真的很不安全，因此需要使用TLS加密避免明文传输

注意：

TLSVerifyClient [never、allow、try、demand] 设置是否验证客户端发起的 tls 连接。

- never：默认选项，服务器响应用户请求时，不验证客户端证书，只需要提供 CA 公有证书即可。
- allow：服务器响应用户请求时，服务要求验证客户端的身份，如果客户端没有证书或者证书无效，会话依然进行。
- try：客户端提供证书，如果没有证书，会话继续进行，如果证书错误，则终止连接。
- demand | hard | true：服务端需要对客户端证书进行验证，客户端需要向 CA 申请证书。

## 2.2 安装使用

根据需要修改 .env 环境变量参数

注意事项：

- ldaps 是已经不再推荐使用的方式，建议使用 tls 双向认证
- 双向认证仍然是 389 端口
- ldapaccountmanager 控制台默认使用的是 ssl 也就是 ldaps 客户端

[genKes.sh](./genKes.sh) 和 [](./genKes-2.sh) 用来生成 openldap 双向认证的密钥。任选其一

安装：

```bash
docker-compose up -d
```

调试命令：

```bash
docker-compose down && docker volume prune -f && rm -rf ldap/ && docker-compose up -d
```

进入openldap容器内，使用dapsearch查询测试：

```bash
LDAP_BASE_DN="dc=example,dc=com"
LDAP_DOMAIN="ldap.example.com"

ldapsearch -Q -LLL -Y EXTERNAL -H ldapi:/// -b cn=config dn
ldapwhoami -ZZ -H "ldap://${LDAP_DOMAIN}" -D "cn=admin,${LDAP_BASE_DN}" -w '8a%.BsgfC~d)1UJx'
ldapwhoami -H "ldaps://${LDAP_DOMAIN}" -D "cn=admin,${LDAP_BASE_DN}" -w '8a%.BsgfC~d)1UJx'

ldapsearch -ZZ -H "ldap://${LDAP_DOMAIN}" -b "${LDAP_BASE_DN}" -D "cn=admin,${LDAP_BASE_DN}" -w'8a%.BsgfC~d)1UJx'
ldapsearch -H "ldaps://${LDAP_DOMAIN}" -b "${LDAP_BASE_DN}" -D "cn=admin,${LDAP_BASE_DN}" -w'8a%.BsgfC~d)1UJx'
```

参考资料：

[openldap验证](https://blog.51cto.com/nanfeibobo/2119719)

[OpenLDAP 与 CA 集成](https://wiki.shileizcc.com/confluence/pages/viewpage.action?pageId=40566848)

[openldap 介绍和使用](https://outmanzzq.github.io/2020/05/12/openldap/)

[OpenLdap安装配置](https://my.oschina.net/yx571304/blog/2231135)

[openldap服务及原数据导入](https://www.jianshu.com/p/aefb071e4b45)

[OpenLDAP多主复制](https://www.cnblogs.com/MR-YY/p/12598170.html)

## 2.3 web 控制台管理工具

- phpldapadmin：

  管理员账号: cn=admin,dc=example,dc=com

  管理员账号: 8a%.BsgfC~d)1UJx

- ldap-account-manager：

  管理员账号: admin

  管理员账号: 8a%.BsgfC~d)1UJx

  lam密码：HO%c42#Tzj4z0F0Y

推荐使用 ldap-account-manager 进行配置管理
