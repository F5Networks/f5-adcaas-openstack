Plug and Play WAF Policies
==========================

For cloud environments, especially the public cloud, there are three
types of WAF policies: (1) Loose, (2) Normal, and (3) Strict.

**Attacks**
~~~~~~~~~~~

Using a testbed, policies are configured for three different BIG-IP VEs.
There are three types of attacks:

(1) **Scenario A**: Attacks are blocked by all three policies.

(2) **Scenario B**: Attacks are blocked by (2) Normal and (3) Strict.
    Attacks are allowed by (1) Loose.

(3) **Scenario C**: Attacks are blocked by (3) Strict.

**Test results**
~~~~~~~~~~~~~~~~

-  **Scenario A** When the HTTP request includes the following type of
   JSON content with an incorrect syntax, all three policies block the
   request:

   .. code-block:: console

      {
        "userid":
      }

-  **Scenario B** When the URL length for the HTTP request is larger
   than a certain value (example: 100), Policy types (2) Normal and (3)
   Strict block this type of request.

-  **Scenario C** When the HTTP request contains JSON content (see
   below) in which the value in the key pair exceeds a certain value
   (example: 10), the policy type (3) Strict blocks the request. (1)
   Loose and (2) Normal allow this type of request.

   .. code-block:: console

      {
        "userid": 123456789012
      }

