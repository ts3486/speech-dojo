use anyhow::{bail, Context};
use aws_config::{BehaviorVersion, Region};
use aws_sdk_s3::config::{Builder as S3ConfigBuilder, Credentials};
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::Client;
use std::env;

#[derive(Clone)]
pub struct StorageService {
    client: Client,
    bucket: String,
    endpoint: String,
}

impl StorageService {
    pub async fn from_env() -> anyhow::Result<Self> {
        let bucket = env::var("S3_BUCKET").context("S3_BUCKET missing")?;
        let endpoint = env::var("S3_ENDPOINT").unwrap_or_else(|_| "http://localhost:9000".into());
        let region = env::var("AWS_REGION").unwrap_or_else(|_| "us-east-1".into());
        let access_key = env::var("S3_ACCESS_KEY")
            .or_else(|_| env::var("AWS_ACCESS_KEY_ID"))
            .context("S3_ACCESS_KEY missing")?;
        let secret_key = env::var("S3_SECRET_KEY")
            .or_else(|_| env::var("AWS_SECRET_ACCESS_KEY"))
            .context("S3_SECRET_KEY missing")?;

        let shared_config = aws_config::defaults(BehaviorVersion::latest())
            .region(Region::new(region.clone()))
            .endpoint_url(endpoint.clone())
            .load()
            .await;

        let credentials = Credentials::new(access_key, secret_key, None, None, "static");

        let s3_config = S3ConfigBuilder::from(&shared_config)
            .force_path_style(true)
            .credentials_provider(credentials)
            .build();

        let client = Client::from_conf(s3_config);

        let service = Self {
            client,
            bucket,
            endpoint,
        };
        Ok(service)
    }

    pub async fn upload_bytes(
        &self,
        key: &str,
        bytes: Vec<u8>,
        content_type: Option<&str>,
    ) -> anyhow::Result<String> {
        let mut req = self
            .client
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .body(ByteStream::from(bytes));

        if let Some(ct) = content_type {
            req = req.content_type(ct);
        }

        req.send().await?;

        let url = format!(
            "{}/{}/{}",
            self.endpoint.trim_end_matches('/'),
            self.bucket,
            key
        );
        Ok(url)
    }

    fn key_from_url(&self, url: &str) -> anyhow::Result<String> {
        if let Some(pos) = url.find(&self.bucket) {
            let after_bucket = &url[pos + self.bucket.len()..];
            let key = after_bucket.trim_start_matches('/');
            if key.is_empty() {
                bail!("could not parse key from url: {}", url);
            }
            return Ok(key.to_string());
        }
        bail!("url does not contain bucket name: {}", url)
    }

    pub async fn get_bytes_from_url(&self, url: &str) -> anyhow::Result<Vec<u8>> {
        let key = self.key_from_url(url)?;
        let obj = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(&key)
            .send()
            .await?;

        let data = obj.body.collect().await?;
        Ok(data.into_bytes().to_vec())
    }
}
