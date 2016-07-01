# Raiden
[![Build Status](https://api.travis-ci.org/peterjcaulfield/raiden.svg)](http://travis-ci.org/peterjcaulfield/raiden)

`raiden` is CLI for interacting with web API's. With some simple configs, `raiden` will allow you to
execute http requests without the overhead of jumping into a browser or fiddling with `curl`.  

## Why

`raiden` can drastically speed up your workflow with features like:

- Tabbed autocompletion makes any interaction with `raiden` convenient and fast. 
- Dynamic request payloads from static configs. No more manual changing of the request payload between requests.
- Cookie Jar out of the box. Cookies are persisted and used in subsequent requests.
- Requests are very easy to define. `raiden` does the heavy lifting.

---

## Table of contents
- [Installation](#installation)
- [Getting started](#getting-started)
- [Multiple request configs](#multiple-request-configs)
- [Custom Headers](#custom-headers)
- [Forms](#forms)
- [Json](#json)
- [TLS/SSL Protocol](#tlsssl-protocol)
- [Dynamic Request Payloads](#dynamic-request-payloads)

---

## Installation

`npm install -g raiden`

To enable tab-completion for bash, add the following to your `.bashrc` script:

`which raiden > /dev/null && . "$( raiden initpath )"`

---

## Getting started

First create a hidden `.raiden` folder in your home directory. You then need to create two config files, one for 
the API hostnames and one for the individual API request definitions.

Hostnames are stored `~/.raiden/envs.yml` as key/value. You can also define a `default` host to be used for when 
no host is provided to `raiden`. An example config looks like so:

```
# ~/.raiden/envs.yml

default: 127.0.0.1:8888
dev_api: dev_api.localhost.com:8888

```

API request definitions are stored in `~/.raiden/requests.yml`. An simple example config with one request defined looks like so:

```
# ~/.raiden/requests.yml

get_posts:
    endpoint: posts

```

Using the above two example configs, we could then execute an API request with:
```
raiden request -e dev_api get_posts
```

This would issue a `GET` request to `http://dev_api.localhost.com/posts`

`raiden` supports most of [node request library](https://github.com/request/request/blob/master/README.md) API which
it is built on top of by way of request-promise.

---

---
## Multiple request configs

`raiden` supports multiple request definition config files. If you are working with multiple API's and you wish to segregate the request definitions 
at the API level to different files, simply create additional .yml config files in the `~/.raiden` directory. You can then tell `raiden` which config file
to use for request definitions using the `raiden config` command with the `--set` option:

```
raiden config --set reqfile acme_api_requests.yml
```

`raiden` will then use `~/.raiden/acme_api_requests.yml` for the request definitions.

---

## Custom headers

```
# ~/.raiden/requests.yml

get_posts:
    endpoint: posts
    method: GET
    headers: 
        User-Agent: raiden
    qs:             
        rpp: 10
        page: 2

```

With this config `raiden get_posts` would execute a `GET` request to default host e.g:

`http://127.0.0.1:8888/posts/?rrp=10&page=2`

---

## Forms

`raiden` supports `application/x-www-form-urlencoded` and `multipart/form-data` form uploads.

### application/x-www-form-urlencoded (URL-Encoded forms)

```
# ~/.raiden/requests.yml

url_encoded_form_request:
    endpoint: form
    method: POST
    form:
        foo: bar
        baz: qux
```

### multipart/form-data (Multipart form uploads)

```
# ~/.raiden/requests.yml

multipart_form_request:
    endpoint: upload
    method: POST
    formData:
        my_field: value 
        file_1: test.txt # this path will be read relative to the .raiden directory
        file_2: /absolute/path/to/img.png # you can also provide absolute paths
```
If you provide a file path as a value, `raiden` will take care of grabbing binary data needed for the request.
Any other values will be left unchanged.

---

## Json

Defining a POST request with a json payload is simple:

```
# ~/.raiden/requests.yml

json_request:
    endpoint: posts
    method: POST
    body:
        title: my post
        author: Ernest Hemingway
        text: this is some post text
    json: true # let raiden know we want to POST as json
```

---
## TLS/SSL Protocol

A request that utilises a self signed SSL cert:

```
# ~/.raiden/requests.yml

login:
    protocol: https
    endpoint: login
    agentOptions:
        ca: /path/to/ca.cert.pem
```
Check out the [node request library](https://github.com/request/request/blob/master/README.md) for more information on
configuration possible with the `agentOptions` object.

---
## Dynamic request payloads
`raiden` allows you to generate dynamic payload data from your static request config using the `transforms` key.

It achieves this by integrating with the fantastic [chance library](https://github.com/chancejs/chancejs) to generate the data. 
A good use case example for a transform would be if you wanted to interact with a user registration API endpoint and it required 
a unique username in the payload of every request. Rather than manually altering the payload everytime you execute the request, 
you can use a transform like so:

```
# ~/.raiden/requests.yml

register:
    method: POST
    endpoint: register
    body:
        username: placeholder # raiden will replace this value
        password: password
    json: true
    transforms:
        - transform: [string, { prefix: hans_gruber_, length: 10 }]
          key: username # execute transform on the username value of the payload
```

The above transform would change the Json POST body of the register request to something like:

```
{
    username: hans_gruber_hkJ983jFn5
    password: password
}
```

`raiden` transforms can also handle generating dynamic values for nested payload props. We just need to specify the path to the prop
using the pipe `|` seperator to delineate the nested object keys. Ex:

```
# ~/.raiden/requests.yml

register:
    method: POST
    endpoint: register
    body:
        data:
            username: placeholder # raiden will replace this value 
            password: password
    json: true
    transforms:
        - transform: [string, { prefix: hans_gruber_, length: 10 }]
          key: data|username 
```
The API of the `transforms` request property is detailed in the API section.

---
