# raiden
[![Build Status](https://api.travis-ci.org/peterjcaulfield/raiden.svg)](http://travis-ci.org/peterjcaulfield/raiden)

`raiden` is CLI dev tool for interacting with web API's. With some simple user defined configs, `raiden` will allow you to
execute requests against API's without the overhead of jumping into a browser or fiddling with `curl`.  

#Why

`raiden` speeds up your workflow with features like:

- Tabbed autocompletion of request names/enviroments making any interaction with `raiden` convenient and fast. 
- Dynamic request payloads from static configs. No more manual changing of the request payload between requests.
- Cookie Jar (cookies are stored and used in subsequent requests for a given domain/path)

#Installation

`npm install -g raiden`

To enable tab-completion for bash, add the following to your `.bashrc` script:

`which raiden > /dev/null && . "$( raiden initpath)"`

#Getting started

First create a hidden `.raiden` folder in your home directory. You then need to create two config files, one for 
the API hostnames and one for the individual API request definitions.


## ~/.raiden/envs.yml

hostnames are stored in this config as key/value. You can also define a `default` host to be used for when 
no host is provided to `raiden`. An example config looks like so:

```
# ~/.raiden/envs.yml

default: 127.0.0.1:8888
dev_api: dev_api.localhost.com:8888

```

## ~/.raiden/requests.yml

This config contains individual API request definitions. An simple example config with one request defined looks like so:

```
# ~/.raiden/requests.yml

get_posts:
    endpoint: posts

```

Using the above two example configs, we could then execute an API request with `raiden request -e dev_api get_posts`

This would issue a `GET` request to `http://dev_api.localhost.com/posts`

`raiden` supports most requests supported by the node request library. These include:

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
        file_1: test.txt # this will be read relative to the .raiden directory
        file_2: /absolute/path/to/img.png # you can also provide absolute paths
```
If you provide a file path as a value, `raiden` takes care of transforming it into a piped binary stream for the request. 
Any other values will be left unchanged.

### Json

Sending a json payload is simple:

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

