# 202408_bedrock_apps

* 2024/08/10に開催されたJAWS-UG 秋田での発表で使ったアプリの一式になります。
* それぞれ2つのディレクトリ(html/lambda)に分かれており、それぞれ次の内容が入っています。

## html
* Bedrockで作成した、WebアプリのHTMLが格納されています。
* htmlファイルが生成された結果、 `prompt.md` がプロンプトです。
    * Claude 3 Haikuで生成しています。
* システムプロンプトに指定してしますが、ライブラリは次の構成で生成するようにしています。
    * Vue.js 3
    * Tailwind CSS
        * Bootstrapの場合もあり
    * Day.js 
    * それぞれCDN経由で利用
* APIアクセスする部分はマスクしているので、デプロイしたURLに差し替えてください。

| ディレクトリ名 | 内容 |
| ----------- | ---- |
| chatter | チャットアプリの内容です |
| image-tagger.uploader | 画像タグ付けアプリのうち、アップロード部分のみの内容です |
| image-tagger.viewwe | 画像タグ付けアプリの内容です |
| textcheck | 文章校正アプリです |
| translator | 翻訳アプリです |

## lambda
* それぞれのアプリで利用するLambda関数です。
* 次の構成で動作するようになっています。
    * Node.js 20
    * arm64
* 環境変数を使っている場合があるので、次の内容を設定してください。

| 環境変数名 | 内容 |
| --------- | --- |
| BEDROCK_MODEL_ID | BedrockのモデルIDを設定します。PresigndURL発行関数以外で設定します |
| BEDROCK_REGION | Bedrockのリージョンを設定します。PresigndURL発行関数以外で設定します |
| DYNAMODB_TABLE | 画像タグ付けアプリで利用するDynamoDBのテーブルを設定します |
| S3_BUCKET | 画像タグ付けアプリで利用するS3のバケット名を設定します |

* それぞれの内容は次の通りです。

| ディレクトリ名 | 内容 | トリガー |
| ----------- | ---- | ------- |
| chatter | チャットアプリの関数です | 関数URL |
| image-tagger/image-processor | S3にアップロードされた関数の画像にタグ付けをする関数です | S3 PutObject |
| image-tagger/presigned-url | 画像タグ付けアプリでS3アップロードに使用するURL(Presigned URL)の発行に使用する関数です | 関数URL |
| image-tagger/tagged-list | 画像タグ付けアプリの一覧表示の関数です | 関数URL |
| textcheck | 文章校正アプリの関数です | 関数URL |
| translator | 翻訳アプリの関数です | 関数URL |

## ライセンス
MIT