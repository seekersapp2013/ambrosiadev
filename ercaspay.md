
Public
ENVIRONMENT
No Environment
LAYOUT
Single Column
LANGUAGE
cURL - cURL
ERCASPAY DEVELOPER DOCUMENTATION
Introduction
Getting started
Authorization
HTTPS Status Codes
Libraries & Plugins
Test Cards
Checkout
Direct Integration
Webhook
ERCASPAY DEVELOPER DOCUMENTATION
Official API Documentation for ErcasPay V1 APIs

Architecture: REST

Data Format: JSON

Sandbox Base url: https://api-staging.ercaspay.com/api/v1

Live Base url: https://api.ercaspay.com/api/v1

Request Headers
* Accept: This field is required & must always be set to application/json

* Content-Type: This field is required & must always be set to application/json

* Authorization: * The initiate transaction endpoint requires a key to authorize the request. * Authorization is a combination of Bearer and your secret key, e.g. Bearer ECRS-TEST-SKLVbpD1J7DG9fwwdyddcAkEysTKsYD564S1NDSUBS.

Keys can be obtained from your ErcasPay dashboard under developer settings. Kindly ensure that your authorization keys are kept safe, secure & shared only when absolutely necessary.

Sample:
json
{
    "Accept": "application/json",
    "Content-Type":" application/json",
    "Authorization":"Bearer {{Your secret Key}}
}
Response:
json
{
    "requestSuccessful": true,
    "responseMessage": "success",
    "responseCode": "success",
    "responseBody": []
}
Field	Type	Description
requestSuccessful	boolean	This indicates if the request was successful or not with a true or false response
responseMessage	string	This can be any message attached to the transaction
responseCode	string	This can be 'success', 'failed' or 'pending'
responseBody	array	Contains relevant response data for the transaction
Getting started
To get started, sign up on Ercas by visiting https://ercaspay.com and verify your account. In the meantime, you can still make integrations with our APIs in test mode, you'll be able to switch to live mode once your account has been approved.

Authorization
There are two "modes" of operation for your ErcasPay account:

Live Mode: Real money, real transactions, real effects. Only switch to this after you've tested your integration thoroughly.

Test Mode: No real money is involved. Only our test cards and bank accounts can be used. We'll still send webhooks and email notifications, and most of the API functions are the same.

Live Dashboard Url: https://merchant.ercaspay.com

Test Dashboard Url: http://merchant-staging.ercaspay.com/

Test keys will always have TEST **in the prefix (for example,`ERCAS-TEST-PK)

Live keys will always have LIVE **in the prefix (for example,ERCAS-LIVE-PK)

Every Api request on behalf of a business should have an Authorization header in the following format

json
{
    Authorization: Bearer TestKey
}
HTTPS Status Codes
Succesful Codes
200 = OK. This implies that the result of an operation (API call) was successful

201 = Created. A 201 status code indicates that a request was successful and as a result, a resource has been created (for example, successful registration of a new user)

Error Codes
When working with our API, you'll encounter some kinds of errors e.g, authorization errors, validation errors, server errors, Watu errors, and provider errors. Each type of error comes with an appropriate HTTP status code.

400 = Bad Request - this response code serves as a generic error code for failed validation requests. Validation errors are returned when your request fails one or more validation rules. Examples include not passing required parameters. They come with a 400 Bad Request status code 

401 = Unauthorized - this response code is sent when the server encounters issues related to authentication/authorization such as CHECKSUM MISMATCH, UNKNOWN CLIENT, FRESH ACCESS TOKEN REQUIRED etc. You'll get authorization errors when you don't provide your secret key to authorize an API call, or when the key provided isn't correct 

403 = Forbidden / Access Denied - this response code is sent when the server understood the request but refuses to authorize it. A request might be forbidden for reasons related or unrelated to credentials. For example - INCOMPLETE REQUEST PARAMETERS REQUIRED FOR AUTHENTICATION. 

404 = Not Found - this response code is sent on attempt to locate a resource/route that doesn't or no longer exist(s) 

500 = Internal Server Error - this response code is sent as a generic error code for failed requests that our server takes full responsibility for. 

Libraries & Plugins
Officially Supported
To make integrations more seamless for developers, official libraries and plugins are available for ercaspay across multiple languages and frameworks.

Javascript SDK: https://www.npmjs.com/package/@capitalsage/ercaspay-js

NodeJS: https://www.npmjs.com/package/@capitalsage/ercaspay-nodejs

React Native: https://www.npmjs.com/package/@capitalsage/ercaspay-react-native-checkout

Flutter: https://pub.dev/packages/ercaspay

Feedback / Support
If you experience any issues while using these libraries, please contact us at support@ercaspay.com.

Community Supported
Our dedicated community of developers maintains open-source libraries in various languages for integrating Ercaspay. Here are some you can use.

Javascript SDK: www.npmjs.com/package/ercaspay-sdk

Angular: https://www.npmjs.com/package/@decodeblock/ercaspay-angular

Ercas For Saas (Reflex.dev): https://github.com/Omotunde2005/Ercas-for-saas

Python: https://www.piwheels.org/project/ercaspay/

.Net: https://www.nuget.org/packages/ErcasPay.12.16.24.002

Feedback / Support
If you experience any issues with these libraries, please contact the developer or open an issue in the repository for assistance.

Test Cards
The following test cards are available

View More
CARD TYPE	PAN	EXPIRY DATE	PIN	CVV	OTP	STATUS
MASTERCARD	2223000000000007	01/39	1234	111	-	Success
VISA	4000000000002503	03/50	1111	111	-	Success
VERVE	5060990580000217499	03/50	1111	111	123456	Success
VERVE	5061830100001895	01/40	1111	111	123456	Failure - Timeout calling issuing bank
VERVE	5060990580000000390	03/50	1111	111	123456	Failure - Insufficient Funds
AUTHORIZATION
Bearer Token
Token
{{SECRET_KEY}}

Checkout
Readily implement the ErcasPay Checkout Page on your websites to enable your customers to make payments on your platform. ErcasPay Page provides your customers with various payment method options such as CARD, BANK TRANSFER, USSD, QRCODE


Please refer to the following links to have a better understanding of each payment channel flow. However, note that you must first complete the payment initiation POST request as shown in the diagram above.

Card Payment Flow

Bank Transfer Flow

USSD Payment Flow

AUTHORIZATION
Bearer Token
This folder is using Bearer Token from collectionERCASPAY DEVELOPER DOCUMENTATION
POST
Initiate Transaction
{{baseUrl}}/payment/initiate
This endpoint allows you to initialize a transaction on ErcasPay and it returns a checkout URL which you can load within a browser to display the payment form to your customer. The checkout URL has an expiry time of 90 minutes.

View More
Field	Mandatory & Optional	Description
amount	M	The amount to be paid by the customer. For local transaction, amount should be above 100 naira
paymentReference	M	Merchant's Unique reference for the transaction.
paymentMethods	M	Comma seperated string of payment methods (card, bank-transfer, qrcode, ussd, etc.). If not specified, all available payment methods enabled on the merchant dashboard will be used.
customerName	M	Full name of the customer.
customerEmail	M	Email address of the customer.
customerPhoneNumber	O	Phone number of the customer.
currency	M	The currency you want to receive payment in. If this is not specified, we use NGN as the default currency. A list of supported currencies are available on the landing page.

Note : Only card supports internaltional currency.
feeBearer	O	The bearer of the charge (either customer or merchant). If not selected, we use the set default on the merchant account. This can be found under settings -> charges
redirectUrl	O	A URL which user will be redirected to, on completion of the payment, if not specified, the default merchant redirect url will be used.
description	O	Description for the transaction.
isCardTokenized	O (true/false)	This let you specify if the card should be tokenized
metadata	O	You can put in any additional information relatating to the transaction, if specified, this will be returned as part of the webhook.
metadata.split_settlement	O	Boolean (true or false) : Specifies whether the transaction settlement should be split across multiple subaccounts. Requires that the subaccounts are already created on your dashboard.
metadata.settlement_ratio	O	JSON Array: An array of objects that define how settlement is split across subaccounts.
• subaccount_id: The ID of the subaccount.
• percentage: The share of the settlement amount for the subaccount.

Percentages must not exceed a total of 100. Any remaining percentage up to 100 is automatically settled into the main account.

Sample
"metadata": { "split_settlement": true, "settlement_ratio": [ { "subaccount_id": "227", "percentage": 30 }, { "subaccount_id": "231", "percentage": 40 } ] }
AUTHORIZATION
Bearer Token
This request is using Bearer Token from collectionERCASPAY DEVELOPER DOCUMENTATION
HEADERS
Accept
application/json

Content-Type
application/json

Authorization
Bearer {{SECRET_KEY}}

Body
raw (json)
View More
json
{
    "amount": 10,
    "paymentReference": "R5md7gd9b4s3h2j5d67g",
    "paymentMethods": "card,bank-transfer,ussd,qrcode",
    "customerName": "John Doe",
    "customerEmail": "johndoe@gmail.com",
    "customerPhoneNumber": "09061626364",
    "redirectUrl": "https://omolabakeventures.com",
    "description": "The description for this payment goes here",
    "currency": "NGN",
    "feeBearer": "customer",
    "isCardTokenized" : true,
    "metadata": {
        "firstname": "Ola",
        "lastname": "Benson",
        "email": "iie@mail.com"
    }
}
Example Request
initiate transaction (Successful)
View More
curl
curl --location -g '{{baseUrl}}/payment/initiate' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{secretKey}}' \
--data-raw '{
    "amount": 10,
    "paymentReference": "R5md7gd9b4s3h2j5d67g",
    "paymentMethods": "card,bank-transfer,ussd,qrcode",
    "customerName": "John Doe",
    "customerEmail": "johndoe@gmail.com",
    "customerPhoneNumber": "09061626364",
    "redirectUrl": "https://omolabakeventures.com",
    "description": "The description for this payment goes here",
    "currency": "USD",
    "feeBearer": "customer",
    "metadata": {
        "firstname": "Ola",
        "lastname": "Benson",
        "email": "iie@mail.com"
    }
}'
200 OK
Example Response
Body
Headers (12)
View More
json
{
  "requestSuccessful": true,
  "responseCode": "success",
  "responseMessage": "success",
  "responseBody": {
    "paymentReference": "R5md7gd9b4s3h2j5d67g",
    "transactionReference": "ERCS|20231113082706|1699860426792",
    "checkoutUrl": "https://sandbox-checkout.ercaspay.com/ERCS|20231113082706|1699860426792"
  }
}
GET
Verify Transaction
{{baseUrl}}/payment/transaction/verify/{transactionRef}
We highly recommend that when you receive a notification from us, you should initiate a verify transaction request to us with the transactionReference to confirm the actual status of that transaction before updating the records on your database.

AUTHORIZATION
Bearer Token
This request is using Bearer Token from collectionERCASPAY DEVELOPER DOCUMENTATION
HEADERS
Accept
application/json

Content-Type
application/json

Authorization
Bearer {{SECRET_KEY}}

Example Request
verify transaction {Successful}
View More
curl
curl --location -g '{{baseUrl}}/payment/transaction/verify/{transactionRef}' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json'
200 OK
Example Response
Body
Headers (12)
View More
json
{
  "requestSuccessful": true,
  "responseCode": "success",
  "responseMessage": "Transaction fetched successfully",
  "responseBody": {
    "domain": "test",
    "status": "SUCCESSFUL",
    "ercs_reference": "ERCS|20231112152333|1699799013942",
    "tx_reference": "CSHM|WLTP|48606GWR",
    "amount": 100,
    "description": null,
    "paid_at": "2023-11-12T14:24:58.000000Z",
    "created_at": "2023-11-12T14:23:33.000000Z",
    "channel": "BANK_TRANSFER",
    "currency": "NGN",
    "metadata": "{\"firstname\":\"Ola\",\"lastname\":\"Benson\",\"email\":\"iie@mail.com\"}",
    "fee": 1.4,
    "fee_bearer": "customer",
    "settled_amount": 100,
    "customer": {
      "name": "Olayemi Olaomo",
      "phone_number": "09061628409",
      "email": "ola@gmail.com",
      "reference": "ZEKvFI-N8lMHY"
    }
  }
}
Direct Integration
You have the option to seamlessly integrate our Payment gateway directly into your platform. This method is particularly advantageous if you plan to establish a self-hosted Payment gateway instead of interfacing with our checkout system to facilitate payment processing.

AUTHORIZATION
Bearer Token
Token
<token>

Card
CARD TRANSACTION FLOW

The card transaction procedures are determined by the type of card being used. When a transaction is initiated, our payment system identifies the card type and generates response codes, such as CO, C1, and C2. These codes indicate whether the payment process will involve a single or multiple layers before completion.

For further clarification, please check the diagram provided below.


AUTHORIZATION
Bearer Token
This folder is using Bearer Token from folderDirect Integration
POST
Initiate Payment
{{baseUrl}}/third-party/payment/cards/initialize
This endpoint facilitates the initiation of a card transaction. Upon initiation, the response received varies based on the type of card used. It may include a link to a 3D authentication page or a message indicating that an OTP (One-Time Password) has been sent to the registered phone number. As this integration is direct, it is your responsibility to retrieve and handle these responses accordingly.

For example, in the case of response code C1, you must provide an interface where the OTP sent to the registered phone number can be entered and submitted to the OTP endpoint. Similarly, for response code C2, redirection to the transactionAuth URL provided in the response is required, allowing the system to manage the subsequent steps of the process.

View More
Field	Mandatory & Optional	Description
payload	M	An encripted version of a card details. Card details should be encripted with RSA algorithm
transactionReference	M	Please pass the transaction reference generated when you initiate the transaction
isCardTokenized	O (true/false)	This let you specify if the card should be tokenized
deviceDetails	M	This contains the device details
payerDeviceDto	M	This is an object inside device details
device	M	This is an object inside payerDeviceDto
browser		This is an object inside device.
browserDetails	M	This is an object inside device
ipAddress	O	ipAddress of the customer device
Card Encryption Sample Codes
View More
java
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bouncycastle.jcajce.provider.asymmetric.rsa.BCRSAPublicKey;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.io.pem.PemReader;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
public class Main {
  public static void main(String[] args) throws NoSuchPaddingException, IllegalBlockSizeException, NoSuchAlgorithmException, BadPaddingException, NoSuchProviderException, InvalidKeyException, IOException {
    //CARD ENCRYPTION SAMPLE CODE USING RSA
    //YOUR CARD DETAILS
    CardParams cardParams = new CardParams();
    cardParams.setCvv("8XX");
    cardParams.setPin("5XXX");
    cardParams.setExpiryDate("07XX"); 
    cardParams.setPan("5399XXXXXXXXXXXX");
    //CONVERT YOUR CARD DETAILS TO STRING
    ObjectMapper mapper = new ObjectMapper();
    String cardParamToString = mapper.writeValueAsString(cardParams);
    //ENCRYPT
    String encryptedData = rsaEncrypt(cardParamToString);
    //OUTPUT ENCRYPTED DATA
    System.out.println(encryptedData);
  }
  public static String rsaEncrypt(String data) throws NoSuchPaddingException, NoSuchAlgorithmException,
    NoSuchProviderException, IOException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException {
    Security.addProvider(new BouncyCastleProvider());
    byte[] encryptedBytes = data.getBytes();
    Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding", "BC");
    cipher.init(Cipher.ENCRYPT_MODE, (Key) retrievePublicKey());
    byte[] encryptedMessage = cipher.doFinal(encryptedBytes);
    return Base64.getEncoder().encodeToString(encryptedMessage);
  }
  private static BCRSAPublicKey retrievePublicKey() throws IOException {
    return readPub("ercas-rsa-pubx"); //Create a file that will hold your public key
  }
  private static BCRSAPublicKey readPub(String filename) throws FileNotFoundException, IOException {
    Resource resource = new ClassPathResource(filename);
    try (PemReader pemReader = new PemReader(new InputStreamReader(new FileInputStream(filename)))) {
      KeyFactory factory = KeyFactory.getInstance("RSA", "BC");
      var pemKey = pemReader.readPemObject();
      var keyByte = pemKey.getContent();
      X509EncodedKeySpec pubKeySpec = new X509EncodedKeySpec(keyByte);
      return (BCRSAPublicKey) factory.generatePublic(pubKeySpec);
    } catch (NoSuchAlgorithmException | InvalidKeySpecException | NoSuchProviderException e) {
      throw new RuntimeException(e);
    }
  }
}
View More
php
function encryptCard()
{
    $public_key = file_get_contents('key/rsa_public_key.pub');
    // Remove "RSA" from the header
    $public_key = str_replace("RSA", "", $public_key);
    // Remove leading and trailing whitespace
    $public_key = trim($public_key);
    // Card details
    $cardParams = [
        'cvv' => '8XX',
        'pin' => '5XXX',
        'expiryDate' => '07XX',
        'pan' => '5399XXXXXXXXXXXX'
    ];
    // Convert card details to JSON
    $cardJson = json_encode($cardParams);
    // Encrypt the card details
    if (openssl_public_encrypt($cardJson, $encrypted, $public_key)) {
        // Return the encrypted data as a Base64-encoded string
        return base64_encode($encrypted);
    } else {
        // Encryption failed
        die("Error: Encryption failed - " . openssl_error_string());
    }
}
echo encryptCard();
View More
python
import json
import base64
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
from Crypto.Hash import SHA1
#DEPENDENCY : pycryptodome
#RUN  pip install pycryptodome
def encryptCard():
    # Read the public key
    with open('key/rsa_public_key.pub', 'rb') as key_file:
        public_key_data = key_file.read()
    public_key = RSA.import_key(public_key_data)
    # Card details
    cardParams = {
        'cvv' : '8XX',
        'pin' : '5XXX',
        'expiryDate' : '07XX',
        'pan' : '5399XXXXXXXXXXXX'
    }
    # Convert card details to JSON
    cardJson = json.dumps(cardParams).encode('utf-8')
    # Encrypt the card details using PKCS1_v1_5 padding
    cipher = PKCS1_v1_5.new(public_key)
    encrypted = cipher.encrypt(cardJson)
    # Return the encrypted data as a Base64-encoded string
    return base64.b64encode(encrypted).decode('utf-8')
print(encryptCard())
AUTHORIZATION
Bearer Token
This request is using Bearer Token from folderDirect Integration
HEADERS
Accept
application/json

Content-Type
application/json

Authorization
Bearer {{SECRET_KEY}}

Body
raw (json)
View More
json
{
  "payload": "Xyy3MrxoDNccMJjPO3zUiERBZxbMUXumcvg4iMQU1Uqix6351T1b4cWo6XKt/qM7lxzQjFBNoLveu9ZFBi20+EWIPxPRpCrru7oRsy1MjJKy2ysQ2RHG5RMCrzNGDZj3KvDElPoMZVtadomaEqa8FQ4g3i7s1mhdK4XHf2giVsmkA3FNuoGyUUXMU1JstmsVAdt75geMg5rbvcgICLmOrCl988STbXnaQpl81XMBhzhcAtkzielaUOosVBW4B87WSGq20XN/13h3p8vQ1CiW8WDfVr0Sw91UlvHbe2tZSyQ+tt5lFwxwAGLKbdeB74oU/mNf93MssaOOlb0FcsDuyQ==",
  "transactionReference": "ERCS|20240809141139|1723209099142",
  "isCardTokenized" : true,
  "deviceDetails": {
    "payerDeviceDto": {
      "device": {
        "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        "browserDetails": {
          "3DSecureChallengeWindowSize": "FULL_SCREEN",
          "acceptHeaders": "application/json",
          "colorDepth": 24,
          "javaEnabled": true,
          "language": "en-US",
          "screenHeight": 473,
          "screenWidth": 1600,
          "timeZone": 273
        },
        "ipAddress": "41.242.77.212"
      }
    }
  }
}
Example Request
successful payment
View More
curl
curl --location -g '{{baseUrl}}/payment/cards/initialize' \
--header 'Accept: application/json' \
--data '{
    "payload": "hQk5jVRv1bqoNB57irP/gqkXvxiqXv+aTdplXbgzqUoJQpGGgBstFBB1YjtTM6+fg5xr+8GGTUOMbxweGvKno8UXYmmdDKBdb3R6JXS08PxG8ZFX2ktoMTkKVrHtt4LQS7Ee73lAA46wz7GDiRI3bj8eWNFxU8/fQ9nE3BbNkIh23RowRvocEiZkP3NQqDWUC94DP2x/+ipyjO6M9ouUf4VIuDTYrVoGKeCNtRHlo9RR6bFWOSGwDN0yTwxxjWX2Pr02pusxRgIodNrDTXzIVFh58zpFE8U42SMMtdeyKeNo+61UZPA4Aznwe6o3VElX0QXk2feq8K3Zo70odxfruw==",
    "transactionReference": "ERCS|20230323155236|1679586756784903"
}'
200 OK
Example Response
Body
Headers (12)
View More
json
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "C0",
  "responseBody": {
    "code": "C0",
    "status": "SUCCESS",
    "gatewayMessage": "APPROVED",
    "transactionReference": "ERCS|20230323155236|1679586756784903",
    "paymentReference": "dhgsygdbshjdg",
    "amount": 10000,
    "redirectUrl": "https://omolabakeventures.com"
  }
}
POST
Submit OTP
{{baseUrl}}/third-party/payment/cards/otp/submit/{transactionRef}
This endpoint is designed to receive OTP (One-Time Password) for card validation purposes. Upon submission, if the OTP is deemed valid, the customer's payment institution is authorized to debit the customer's bank account. If the debit transaction is successful, you will be redirected accordingly.

Field	Mandatory & Optional	Description
otp	M	Otp that was sent to the registered number
M	Otp that was sent to the registered number
gatewayReference	M	gateway reference should be retrieve from {{baseUrl}}/payment/cards/initialize endpoint
AUTHORIZATION
Bearer Token
This request is using Bearer Token from folderDirect Integration
HEADERS
Accept
application/json

Content-Type
application/json

Authorization
Bearer {{SECRET_KEY}}

Body
raw (json)
json
{
    "otp": "123456",
    "gatewayReference": "1gHS60sPRO"
}
Example Request
submit OTP
curl
curl --location -g '{{baseUrl}}/payment/cards/otp/submit/transactionRef}' \
--header 'Accept: application/json' \
--data '{
    "otp": "123456",
    "gatewayReference": "1gHS60sPRO"
}'
200 OK
Example Response
Body
Headers (12)
View More
json
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "00",
  "responseBody": {
    "status": "SUCCESS",
    "gatewayMessage": "OTP Authorization Successful",
    "transactionReference": "ERCS|20230323155236|1679586756784903",
    "paymentReference": "dhgsygdbshjdg",
    "amount": 10000,
    "callbackUrl": "https://omolabakeventures.com"
  }
}
