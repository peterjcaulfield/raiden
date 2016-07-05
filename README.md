# Raiden
[![Build Status](https://api.travis-ci.org/peterjcaulfield/raiden.svg)](http://travis-ci.org/peterjcaulfield/raiden)

`raiden` is a CLI built on top of the node [request](https://github.com/request/request/blob/master/README.md) module and is 
designed for interacting with web API's. With some simple configs `raiden` allows you to execute http requests without 
the overhead of jumping into a browser or fiddling with `curl`.  

## Why

`raiden` can drastically speed up your workflow when working with API's with features like:

- Tabbed autocompletion. 
- Dynamic request payloads from static configs. No more manual changing of the request payload between requests.
- Cookie Jar out of the box. Cookies are persisted and used in subsequent requests.
- Easy to define requests. `raiden` does the heavy lifting.

---

## Table of contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Using Multiple Request Configs](#using-multiple-request-configs)
- [Example Request Definitions](#example-request-definitions)
    - [Simple GET Request](#simple-get-request)
    - [Forms](#forms)
    - [Json](#json)
    - [Custom Headers](#custom-headers)
    - [Http Authentication](#http-authentication)
    - [TLS/SSL Protocol](#tlsssl-protocol)
    - [Dynamic Request Payloads](#dynamic-request-payloads)
- [Additional Tips](#additional-tips)

---

## Installation

`npm install -g raiden`

To enable tab-completion for bash, add the following to your `.bashrc` script:

`which raiden > /dev/null && . "$( raiden initpath )"`

---

## Getting started

On install, a hidden `.raiden` folder will have been created in your home directory containing two `.yml` files, 
one for the API hostnames and one for the individual API request definitions.

Hostnames are stored `~/.raiden/envs.yml` as key/value. You can also define a `default` host to be used for when 
no host is provided to `raiden`. An example config looks like so:

```
# ~/.raiden/envs.yml

default: 127.0.0.1:8888
staging: staging.localhost.com:8888

```

*NOTE:* Do not include the protocol in the host definition. `raiden` will use `http` protocol by default for all requests.
If you want to use `https` set the `protocol` property in your request definition to `https`.

API request definitions are stored in `~/.raiden/requests.yml`. A simple example config with one request defined looks like so:

```
# ~/.raiden/requests.yml

get_posts:
    endpoint: posts

```

Using the above two example configs, we could then execute an API request with:

```
$ raiden request -e staging get_posts
```

This would issue a `GET` request to `http://staging.localhost.com/posts`

Multiple requests can be given to `raiden request` at the same time as arguments:

```
raiden request -e staging request1 request2 request3 ...
```

Use `raiden --help` to learn more about raidens exec options and commands. 

---

## Using multiple request configs

`raiden` supports multiple request definition config files. If you are working with multiple API's and you wish to segregate the request definitions 
at the API level to different files, simply create additional .yml config files in the `~/.raiden` directory. 

You can then tell `raiden` which config file
to use for request definitions using the `raiden config` command with the `--set` option:

```
$ raiden config --set reqfile acme_api_requests.yml
```

`raiden` will then use `~/.raiden/acme_api_requests.yml` for the request definitions. 

You can confirm the file that's currently being used for request definitions by executing:

```
$ raiden config --list
reqfile:acme_api_requests.yml
```

---

## Example Request Definitions

`raiden` endeavours to support most of the [node request library](https://github.com/request/request/blob/master/README.md) API which
it is built on top of by way of request-promise. `raiden` will pass nearly all request config props transparently through to the request lib
unchanged. The notable exceptions are detailed below (filepath values being transformed where applicable in forms/agent options etc). As such
it is helpful to consult the [node request library docs](https://github.com/request/request#requestoptions-callback) if you are looking to do
something with a request that is not detailed in the following examples.

### Simple GET Request

```
# ~/.raiden/requests.yml

get_posts:
    endpoint: posts
    method: GET
    qs:             
        rpp: 10
        page: 2

```

With this config `raiden request get_posts` would execute a `GET` request to default host:

`http://127.0.0.1:8888/posts/?rrp=10&page=2`

--

### Forms

`raiden` supports `application/x-www-form-urlencoded` and `multipart/form-data` form uploads.

#### application/x-www-form-urlencoded (URL-Encoded forms)

```
# ~/.raiden/requests.yml

url_encoded_form_request:
    endpoint: form
    method: POST
    form:
        foo: bar
        baz: qux
```

#### multipart/form-data (Multipart form uploads)

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

--

### Json

Defining a POST request with a json payload is simple:

```
# ~/.raiden/requests.yml

json_request:
    endpoint: posts
    method: POST
    body:
        author: W. Whitman
        title: Leaves of Grass
        text: A blade of grass is the journeywork of the stars...
    json: true # let raiden know we want to POST as json
```

--

### Custom Headers

```
# ~/.raiden/requests.yml

get_posts:
    endpoint: posts
    method: GET
    headers: 
        User-Agent: raiden

```

--

### HTTP Authentication

```

# ~/.raiden/requests.yml

login:
    protocol: https
    endpoint: login
    auth:
        username: username
        password: password
        sendImmediately: false

```
See the [request library](https://github.com/request/request#http-authentication) for more information on this configration.

--

### TLS/SSL Protocol

A request that utilises a self signed SSL cert:

```
# ~/.raiden/requests.yml

login:
    protocol: https
    endpoint: login
    agentOptions:
        ca: /path/to/ca.cert.pem
```
See the [request library](https://github.com/request/request#tlsssl-protocol) for more information on this configration.

--

### Dynamic request payloads

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
        - transform: 
            method: string
            args: 
                length: 10
            prefix: hans_gruber
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
using a period '.' seperator to delineate the nested object keys:

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
        - transform: 
            method: string
            args: 
                length: 10
            prefix: hans_gruber
          key: data.username 
```

#### transforms API

- `transforms` - array of transform objects.
    - `transform` - object describing the transform.
        - `method` - the method to call in the [chance library](https://github.com/chancejs/chancejs) to generate the new value.
        -  `args` - object of arguments to pass to the chance libary method.
        - `prefix` - optional string to prepend to the generated value.
        - `suffix` - optional string to append to the generated value.
    - `key` - string specifying the property in the request payload that will be transformed.

Check out the [chance library docs](http://chancejs.com/) for what's possible with the data generation.

---
### Additional Tips

Autocomplete by default requires you to hit `tab` twice if there are multiple possible matches for the input. This annoying.
I would highly suggest putting the following into your `~/.inputrc` for a nicer autocomplete experience:

```
set show-all-if-ambiguous on
```

---

### License 

MIT
