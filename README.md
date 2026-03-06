# posteingang

A collection of tools to publish blog posts from your email client.

## Packages

| Package               | Binary             | Description                                     |
| --------------------- | ------------------ | ----------------------------------------------- |
| `@posteingang/mailmd` | `mailmd`, `mdmail` | Convert `.eml` ↔ Markdown                       |
| `@posteingang/api`    | `mdapi`            | Generate static JSON API from mailmd output     |
| `@posteingang/dog`    | `dog`              | Watch an inbox folder and run the full pipeline |

## Data flow

```
.eml file
  → mailmd  → dist/YYYY-MM-DD-HHmmss/message.md + images
  → mdapi   → dist/posts.json + dist/posts/{slug}.json
```

Both mailmd output and JSON API share the same `dist/` directory.

---

## mailmd

Converts `.eml` files to Markdown directories. HTML is converted to Markdown, embedded images are extracted and resized, and email headers become YAML frontmatter.

```
mailmd [file] [-o <dir>]
```

| Argument / Option | Default                     | Description            |
| ----------------- | --------------------------- | ---------------------- |
| `[file]`          | stdin                       | `.eml` file to convert |
| `-o, --out <dir>` | `$OUT_DIRECTORY` or `./out` | Output directory       |

**Output structure:**

```
./out/YYYY-MM-DD-HHmmss/
├── message.md
├── image0.jpg
└── ...
```

**Frontmatter fields:** `id`, `date`, `updatedAt`, `title`, `tags` (if present), `assets` (images with width/height/orientation). Additional fields can be embedded in the email body as a YAML block.

### mdmail

Reverse converter — turns a mailmd output folder back into a nodemailer config JSON.

```
mdmail <folder> [-f <from>] [-t <to>] [-s <subject>]
```

---

## mdapi

Scans a `dist/` directory for `message.md` files and generates a Strapi v5-compatible static JSON API. Posts with `published: false` are excluded.

```
mdapi [dir] [-a <adapter>]
```

| Argument / Option      | Default   | Description    |
| ---------------------- | --------- | -------------- |
| `[dir]`                | `./dist`  | dist directory |
| `-a, --adapter <name>` | `strapi5` | API adapter    |

**Output:**

```
./dist/
├── posts.json           # list with pagination envelope
└── posts/
    └── YYYY-MM-DD-HHmmss.json
```

---

## dog

Daemon that watches an inbox folder for `.eml` files, converts them with mailmd, rebuilds the API, and optionally verifies the sender via a hash in the recipient address.

```
dog [in] [dist] [-d <url>] [-s <salt>]
```

| Argument / Option         | Default  | Description                                          |
| ------------------------- | -------- | ---------------------------------------------------- |
| `[in]`                    | `./in`   | Inbox folder to watch                                |
| `[dist]`                  | `./dist` | Output folder for posts and API                      |
| `-d, --deploy-hook <url>` | —        | Webhook URL to POST to after each API rebuild        |
| `-s, --salt <value>`      | —        | HMAC-SHA256 salt for sender verification (see below) |

### Sender verification

When `--salt` is set, dog only processes emails where the recipient address contains a valid HMAC of the sender's address:

```
inbox+HASH@yourdomain.com
```

`HASH` = first N hex characters of `HMAC-SHA256(salt, from@address)`. Emails that fail the check are deleted. Generate a hash with:

```sh
node -e "const {createHmac}=require('crypto'); \
  console.log(createHmac('sha256','YOUR_SALT').update('sender@example.com').digest('hex').slice(0,8))"
```

---

## Development

```sh
pnpm install

pnpm test          # run tests
pnpm test:watch    # run tests in watch mode

pnpm lint          # lint
pnpm lint:fix      # lint + auto-fix
pnpm format        # format
```

## License

None yet, subject to change.
