# Mailblog

TLDR; This is barely enough to get my blog running. 

## What is this?

It's a Node.js binary which accepts email messages via std.in and converts them to images and markdown files. It also generates a JSON based index and a combined JSON file for all posts.

This works if you have a server that allows piping incoming messages into a binary e.g. through qmail. I use [Uberspace](https://uberspace.de/en/) which provides this out of the box.
