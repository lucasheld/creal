import fs from 'fs'
import { ServerResponse, IncomingMessage } from 'http'
import { URL } from 'url'

import S3 from 'aws-sdk/clients/s3'
import AWS from 'aws-sdk'

export default {
  path: '/api/player/signedUrl',
  handler(req: IncomingMessage, res: ServerResponse) {
    const s3 = new S3({
      apiVersion: '2006-03-01',
      credentials: new AWS.SharedIniFileCredentials({
        filename: '/run/secrets/creal_aws-credentials',
      }),
      endpoint: 'https://s3.nl-ams.scw.cloud',
      region: 'nl-ams',
    })

    const bucket = fs.readFileSync('/run/secrets/creal_aws-bucket', 'utf8')
    const key = new URL(
      req.url !== undefined ? req.url : '',
      'https://example.org/'
    ).searchParams.get('key')

    s3.getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Expires: 21600, // 6h
      Key: key,
    }).then(
      function (url) {
        res.end(url)
      },
      function (err) {
        res.writeHead(500)
        res.end(err.message)
      }
    )
  },
}
