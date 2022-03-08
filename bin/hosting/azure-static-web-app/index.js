const path = require('path');
const fs = require('fs').promises;

const buildInProviders = ['aad', 'github', 'twitter'];

module.exports = class AzureStaticWebApp {
    constructor({ options }) {
        this.options = options;
    }

    async apply() {
        const hosting = this.options.hosting;
        if (!hosting || hosting.type !== 'azure-static-web-app')
            return;

        const config = {
            routes: [],
            responseOverrides: {
                404: {
                    rewrite: '/404.html'
                }
            },
            auth: {
                identityProviders: {}
            }
        };

        if ('privateAccess' in hosting) {
            config.routes.push({
                route: '/assets/*',
                allowedRoles: ['anonymous', 'authenticated']
            }, {
                route: '/*',
                allowedRoles: hosting.privateAccess.roles
            });

            if ('providers' in hosting.privateAccess) {
                for (const provider of hosting.privateAccess.providers) {
                    if (buildInProviders.includes(provider))
                        continue;

                    if (provider === 'google') {
                        config.auth.identityProviders['google'] = {
                            registration: {
                                clientIdSettingName: '{GOOGLE_CLIENT_ID}',
                                clientSecretSettingName: '{GOOGLE_CLIENT_SECRET}'
                            }   
                        }
                    }
                }

                for (const provider of buildInProviders) {
                    if (hosting.privateAccess.providers.includes(provider))
                        continue;

                    config.routes.unshift({
                        route: `/.auth/login/${provider}`,
                        statusCode: 404
                    });
                }
            }
        }

        if ('routes' in hosting) {
            if ('signOut' in hosting.routes) {
                config.routes.unshift({
                    route: hosting.routes.signOut.route,
                    redirect: '/.auth/logout',
                    statusCode: 302
                });
            }
        }

        if ('responseOverrides' in hosting) {
            if ('401' in hosting.responseOverrides) {
                config.routes.unshift({
                    route: hosting.responseOverrides[401],
                    rewrite: '/401.html',
                    allowedRoles: ['anonymous']
                });
            }

            if ('403' in hosting.responseOverrides) {
                config.routes.unshift({
                    route: hosting.responseOverrides[403],
                    rewrite: '/403.html',
                    allowedRoles: ['authenticated']
                });
            }

            for (const [key, value] of Object.entries(hosting.responseOverrides)) {
                config.responseOverrides[key] = {
                    redirect: value
                }
            }
        }

        await fs.writeFile(path.resolve(this.options.dst, 'staticwebapp.config.json'), JSON.stringify(config));
    }
}