# Mailblog

TLDR; This is barely enough to get my blog running. 

## What is this?

It's a Node.js-based daemon that observes a directory for emails and transforms them into rescaled images and Markdown inside static JSON files. It also triggers a build hook after the files got updated.

This works if you have a server that exposes your email inbox as a directory, I didn't bother with IMAP or other stuff. I use [Uberspace](https://uberspace.de/en/) which provides this out of the box.
