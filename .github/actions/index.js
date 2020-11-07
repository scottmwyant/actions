const https = require('https');
const semver = require('semver');
const core = require('@actions/core');

function checkMarketplaceVersion(extensionId, proposedVersion) {

    const options = {
        host: 'marketplace.visualstudio.com',
        path: '/_apis/public/gallery/extensionquery',
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json;api-version=3.0-preview.1'
        }
    };

    const body = {
        "filters": [
            {
                "criteria": [
                    {
                        "filterType": 7,
                        "value": "publisher.extension"
                    }
                ]
            }
        ],
        "flags": 914
    };

    const onResponse = response => {

        let str = '';
        
        response.on('data', chunk => str += chunk);
        
        response.on('end', () => {
            const ext = (JSON.parse(str)).results[0].extensions[0];
            const marketplaceVersion = ext.versions[0].version;
            const proposedVersionIsValid = semver.gt(proposedVersion, marketplaceVersion);
            console.log(`Input extensionId: ${extensionId}`);
            console.log(`Marketplace version number: ${marketplaceVersion}`);
            console.log(`Proposed version number: ${proposedVersion}`);
            console.log(`Proposed version is greater: ${proposedVersionIsValid}`);
            if (!proposedVersionIsValid) { 
                core.setFailed(`[ERROR] Proposed version number is lower than the version in the marketplace`);
            }
        });
    }
    
    body.filters[0].criteria[0].value = extensionId;
    const req = https.request(options, onResponse);
    req.write(JSON.stringify(body));
    req.end();
}

try {
    checkMarketplaceVersion(core.getInput('extensionId'), core.getInput('proposedVersion'));
}
catch (err) {
    core.setFailed(err)
}
