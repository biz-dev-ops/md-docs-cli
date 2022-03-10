const path = require('path');
const fs = require('fs').promises;
const chalk = require('chalk-next');

const buildInProviders = ['aad', 'github', 'twitter'];

module.exports = class AzureStaticWebApp {
    constructor({ options }) {
        this.options = options;
    }

    async apply() {
        const hosting = this.options.hosting;
        if (!hosting || hosting.type !== 'azure-static-web-app')
            return;

        
        console.info();
        console.info(chalk.yellow(`hosting ${hosting.type} found.`));
        
        const config = {
            routes: [],
            responseOverrides: {
                404: {
                    rewrite: '/404.html',
                    headers: {
                        "Cache-Control": "no-store"
                    }
                }
            },
            auth: {
                identityProviders: {}
            }
        };

        if ('privateAccess' in hosting) {
            console.info(chalk.green(`\t* configuring role based access.`));

            config.routes.push({
                route: '/assets/*',
                allowedRoles: ['anonymous', 'authenticated']
            }, {
                route: '/*',
                allowedRoles: hosting.privateAccess.roles,
                headers: {
                    "Cache-Control": "no-store"
                }
            });

            if ('providers' in hosting.privateAccess) {                
                for (const provider of hosting.privateAccess.providers) {
                    console.info(chalk.green(`\t* adding ${provider} identity provider.`));

                    if (buildInProviders.includes(provider))
                        continue;

                    if (provider === 'google') {
                        config.auth.identityProviders['google'] = {
                            registration: {
                                clientIdSettingName: '{GOOGLE_CLIENT_ID}',
                                clientSecretSettingName: '{GOOGLE_CLIENT_SECRET}'
                            }
                        };
                    }
                }

                for (const provider of buildInProviders) {
                    if (hosting.privateAccess.providers.includes(provider))
                        continue;

                    console.info(chalk.green(`\t* removing ${provider} identity provider.`));

                    config.routes.unshift({
                        route: `/.auth/login/${provider}`,
                        statusCode: 404
                    });
                }
            }
        }

        if ('routes' in hosting) {
            if ('logout' in hosting.routes) {
                console.info(chalk.green(`\t* adding logout route.`));

                config.routes.unshift({
                    route: hosting.routes.logout.route,
                    redirect: '/.auth/logout'
                });
            }
        }

        if ('responseOverrides' in hosting) {
            if ('401' in hosting.responseOverrides) {
                console.info(chalk.green(`\t* adding 401 route.`));

                config.routes.unshift({
                    route: hosting.responseOverrides[401],
                    rewrite: '/401.html',
                    allowedRoles: ['anonymous'],
                    headers: {
                        "Cache-Control": "no-store"
                    }
                });
            }

            if ('403' in hosting.responseOverrides) {
                console.info(chalk.green(`\t* adding 403 route.`));

                config.routes.unshift({
                    route: hosting.responseOverrides[403],
                    rewrite: '/403.html',
                    allowedRoles: ['authenticated'],
                    headers: {
                        "Cache-Control": "no-store"
                    }
                });
            }

            for (const [key, value] of Object.entries(hosting.responseOverrides)) {
                console.info(chalk.green(`\t* adding ${key} response override.`));

                config.responseOverrides[key] = {
                    redirect: value
                };
            }
        }

        await fs.writeFile(path.resolve(this.options.dst, 'staticwebapp.config.json'), JSON.stringify(config));
    }
}