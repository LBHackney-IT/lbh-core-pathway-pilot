# Connecting to live databases

> ⚠️ **Warning**: Particularly if you're connecting to a production database,
> proceed with caution and if possible, look to pair with someone else.

Using details in AWS and a database client, you can connect via a bastion host
to the PostgreSQL database for the application from your local machine.

## Prerequisites

- Access to the relevant AWS account for the environment, see [environments](#environments)
- A database client e.g. [pgAdmin](https://www.pgadmin.org), [DataGrip](https://www.jetbrains.com/datagrip/), etc.

## Environments

| Environment | AWS account                      | Key  | EC2 bastion                        |
|-------------|----------------------------------|------|------------------------------------|
| Testing     | Social-Care-Workflows-Staging    | dev  | social-care-workflows-dev-bastion  |
| Staging     | Social-Care-Workflows-Staging    | stg  | social-care-workflows-stg-bastion  |
| Production  | Social-Care-Workflows-Production | prod | social-care-workflows-prod-bastion |

## Connecting to the PostgreSQL (RDS PostgreSQL) database

> ℹ️ **Information**: The steps and terminology for each database client will be
> slightly different, but they'll all ask for the same information.

1. Open your database client and add a new data source for a PostgreSQL database
2. Name your database source e.g. Workflows (Staging)

Within the relevant AWS account:

3. Go to **EC2** → **Instances**
4. Click on your relevant EC2 bastion, see [environments](#environments)
5. Under the **Details** tab and **Instance summary** section, copy the **Public IPv4 DNS**

Back within your database client:

6. Create a SSH tunnel and set the copied value for Public IPv4 DNS as the **host** and **ec2-user** as the username

Back in AWS:

7. Go to **Secrets Manager**
8. Search for **social-care-workflows_<environment-key>_private_key**, replacing **<environment-key>** with the key 
   for the environment e.g. social-care-workflows_stg_private_key, see [environments](#environments)
9. Click on the **social-care-workflows_<environment-key>_private_key** secret
10. Under **Secret value**, click on **Retrieve secret value**
11. Copy the private key

On your local machine:

12. Create a new `.pem` file in your `~/.ssh` folder e.g. `social-care-workflows-staging.pem` with the private key

Back within your database client:

13. Select authentication type as "key pair" or similar
14. Select the path of the private key you just created as the private key file for the SSH tunnel

Back in AWS:

15. Go to **Systems Manager** → **Parameter Store**
16. Search for **social-care-workflows-<environment-key>/database/url**, replacing **<environment-key>** with the key 
for the environment, see [environments](#environments)
17. Click on the **social-care-workflows-<environment-key>/database/url** parameter store value
18. Click on **Show** for the **Value**

Back within your database client:

19. Under "General" or similar, fill in the values for **host**, **port**, **user**, **password** and **database** by 
extracting parts of the database URL

```
postgres://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>
```

20. Test and create the data source

> 💡 **Hint**: Some database clients allow you to set a data source as
> read-only, this is to prevent accidentally making changes on a database you
> didn't mean to. Further to this, if helpful for you, some clients also allow
> you to customise the colour of each connection, so you can more easily differentiate them. 
> If possible, set these for production.

Tables live under the `public` schema, see below for an example query:

```sql
SELECT * FROM public."Workflow" LIMIT 10;
```
