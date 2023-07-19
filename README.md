# picamera-server

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-blue?logo=vercel)](https://picamera-server.vercel.app/)

> Visit [https://picamera-server.vercel.app/](https://picamera-server.vercel.app/) to view your Picamera after 
> following the [instructions](https://github.com/UnsignedArduino/picamera-server-api/blob/main/README.md#install) to 
> start the backend server on the Raspberry Pi!

The frontend to view and control your PiCamera on your Raspberry Pi, with support for the Waveshare Pan-tilt HAT!

The backend can be found
at [https://github.com/UnsignedArduino/picamera-server-api](https://github.com/UnsignedArduino/picamera-server-api).

## Install

1. Have `nodejs` installed.
2. Clone this repo.
3. `yarn` to install dependencies.

## Development

Use `yarn run dev` to start a development server.

Before commit, make sure to format, (`yarn run format` / `yarn run writeFormat`) lint, (`yarn run lint` / `yarn run writeLint`)
and type-check. (`yarn run typecheck`)

## Build and serve

`yarn run build` and `yarn run start`.

Note you must also follow the instructions to start the backend server. 

Picamera server is currently deployed on Vercel at [https://picamera-server.vercel.app/](https://picamera-server.vercel.app/).
