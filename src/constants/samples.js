export const sampleSchemaText = `{
  "title": "Payment",
  "description": "Select a payment option from the list below to complete your transaction.",
  "type": "object",
  "required": ["billing_information"],
  "properties": {
    "billing_information": {
      "title": "Billing Information",
      "type": "object",
      "required": [
        "first_name",
        "last_name",
        "address",
        "state_province",
        "city",
        "barangay",
        "postal_code",
        "contact_number"
      ],
      "properties": {
        "first_name": {
          "title": "First Name",
          "type": "string",
          "pattern": "first_name"
        },
        "last_name": {
          "title": "Last Name",
          "type": "string",
          "pattern": "last_name"
        },
        "address": {
          "title": "Address Line",
          "type": "string",
          "maxLength": 60
        },
        "state_province": {
          "title": "Region",
          "type": "string",
          "enum": ["NCR", "Region I"]
        },
        "city": {
          "title": "City/Municipality",
          "type": "string",
          "enum": ["Quezon City", "Makati"]
        },
        "barangay": {
          "title": "Barangay",
          "type": "string",
          "enum": ["Bagumbayan", "Loyola Heights"]
        },
        "postal_code": {
          "title": "Postal Code",
          "type": "string",
          "pattern": "ph_postal_code",
          "maxLength": 4
        },
        "contact_number": {
          "title": "Phone Number",
          "type": "string",
          "pattern": "contact_number_ph"
        }
      }
    }
  }
}`;

export const sampleApiResponseText = `{
  "billing_information": {
    "first_name": "John",
    "last_name": "Doe",
    "address": "123 Katipunan Ave",
    "state_province": "NCR",
    "city": "Quezon City",
    "barangay": "Bagumbayan",
    "postal_code": "1110",
    "contact_number": "09171234567"
  }
}`;