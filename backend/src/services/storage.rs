use anyhow::Context;
use aws_config::{BehaviorVersion, Region};
use aws_sdk_s3::config::Builder as S3ConfigBuilder;
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

        let shared_config = aws_config::defaults(BehaviorVersion::latest())
            .region(Region::new(region.clone()))
            .endpoint_url(endpoint.clone())
            .load()
            .await;

        let s3_config = S3ConfigBuilder::from(&shared_config)
            .force_path_style(true)
            .build();

        let client = Client::from_conf(s3_config);

        Ok(Self {
            client,
            bucket,
            endpoint,
        })
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

        let url = format!("{}/{}/{}", self.endpoint.trim_end_matches('/'), self.bucket, key);
        Ok(url)
    }
}
