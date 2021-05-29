const got = require('got');

export interface githubReleaseProps {
    tag: string;
    notes: string;
    host: string;
    project: string;
    secret: string;
}

export const githubRelease = async (props: githubReleaseProps) => {
    const apiBaseUrl = `https://${props.host}`;
    const apiOptions = {
        headers: {Authorization: `token ${props.secret}`},
    };

    await got.post(`${apiBaseUrl}/repos/${props.project}/releases`, {
        ...apiOptions,
        json: {
            name: `Release: ${props.tag}`,
            tag_name: props.tag,
            body: props.notes || 'No release notes.',
        },
    });
};
