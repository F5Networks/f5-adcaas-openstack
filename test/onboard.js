let request = require('supertest');
let expect = require('chai').expect;

let sleep = async function(ms) {
  await new Promise(reslFunc => {
    setTimeout(reslFunc, ms);
  });
}

let OS_AUTH_URL = process.env.OS_AUTH_URL;
let OS_USERNAME = process.env.OS_USERNAME;
let OS_PASSWORD = process.env.OS_PASSWORD;
let OS_PROJECT_ID = process.env.OS_PROJECT_ID;
let OS_DOMAIN_NAME = 'Default';
let OS_REGION_NAME = 'regionOne';
let OS_INTERFACE = 'public';

let ADCAAS_URL = process.env.ADCAAS_URL;

let token_request = {
  "auth": {
    "identity": {
      "methods": [
        "password"
      ],
      "password": {
        "user": {
          "name": OS_USERNAME,
          "domain": {
            "name": OS_DOMAIN_NAME
          },
          "password": OS_PASSWORD
        }
      }
    },
    "scope": {
      "project": {
        "id": OS_PROJECT_ID
      }
    }
  }
};

let adc_request = {
  "name": "zhaoqin-adc",
  "type": "VE",
  "networks": {
    "mgmt1": {
      "type": "mgmt",
      "networkId": "5829bf01-19a1-477f-a757-0a5225041309"
    },
    "failover1": {
      "type": "ha",
      "networkId": "d7e8635f-2d3a-42aa-a40e-8fbb177464bf"
    },
    "internal1": {
      "type": "int",
      "networkId": "6acb25ec-dc68-4e07-ba45-e1a11567f9ca"
    },
    "external2": {
      "type": "ext",
      "networkId": "1c19251d-7e97-411a-8816-6f7a72403707"
    }
  },
  "compute": {
    "imageRef": "697f531d-d38e-4613-a345-4536f6aa2968",
    "flavorRef": "201906"
  }
};

describe('ADC VE Onboard Test', function() {

  let token = '';

  let adc_id = '';

  before(async function() {
    let resp = await request(OS_AUTH_URL)
      .post('/auth/tokens')
      .set('Content-Type', 'application/json')
      .send(token_request);

    expect(resp.status).to.equal(201)
    token = resp.header['x-subject-token'];
  });

  describe('Ping', function() {
    it('GET /ping', async function() {
      let resp = await request(ADCAAS_URL)
        .get('/ping')
        .set('X-Auth-Token', token);

      expect(resp.status).to.equal(200);
    });
  });

  describe('Onboarding Test', function() {
    it('Create ADC VE', async function() {
      let resp = await request(ADCAAS_URL)
        .post('/adcs')
        .set('X-Auth-Token', token)
        .send(adc_request);

      expect(resp.status).to.equal(200);
      expect(resp.body.adc.status).to.equal('NEW');

      adc_id = resp.body.adc.id;
    });

    it('Provision ADC VE', async function() {
      let resp = await request(ADCAAS_URL)
        .post('/adcs/' + adc_id + '/action')
        .set('X-Auth-Token', token)
        .send({
          'create': null
        });

      expect(resp.status).to.equal(200);
    });

    it('Wait POWERON', async function() {
      this.timeout(300000);

      let retry = 60;
      while (retry-- > 0) {
        let resp = await request(ADCAAS_URL)
          .get('/adcs/' + adc_id)
          .set('X-Auth-Token', token);

        expect(resp.status).to.equal(200);
        await sleep(5000);
        expect(resp.body.adc.status).not.include('ERROR');

        if (resp.body.adc.status === 'POWERON') {
          break;
        }
      }
    });

    it('Setup ADC VE', async function() {
      let resp = await request(ADCAAS_URL)
        .post('/adcs/' + adc_id + '/action')
        .set('X-Auth-Token', token)
        .send({
          'setup': null
        });

      expect(resp.status).to.equal(200);
    });

    it('Wait ACTIVE', async function() {
      this.timeout(300000);

      let retry = 60;
      while (retry-- > 0) {
        let resp = await request(ADCAAS_URL)
          .get('/adcs/' + adc_id)
          .set('X-Auth-Token', token);

        expect(resp.status).to.equal(200);
        await sleep(5000);
        expect(resp.body.adc.status).not.include('ERROR');

        if (resp.body.adc.status === 'ACTIVE') {
          break;
        }
      }
    });
  });
});
