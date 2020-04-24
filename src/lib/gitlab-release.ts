import {createReadStream} from 'fs';
import {resolve} from 'path';
import * as FormData from 'form-data';
const got = require('got');

export interface gitlabReleaseProps {
    tag: string;
    assets: string[];
    notes: string;
}

export const gitlabRelease = async (props: gitlabReleaseProps) => {
    const assetsList: any = [];
    const apiBaseUrl = process.env.CI_API_V4_URL;
    const apiProjectId = process.env.CI_PROJECT_ID;
    const projectUrl = process.env.CI_PROJECT_URL;
    const gitlabToken = process.env.CT_TOKEN;
    const apiOptions = {headers: {'PRIVATE-TOKEN': gitlabToken}};
    const encodedTag = encodeURIComponent(props.tag);

    // Remote a release. Handy for testing
    // await got.delete(`${apiBaseUrl}/projects/${apiProjectId}/releases/${encodedTag}`, {...apiOptions});
    // return;

    if (props.assets.length > 0) {
        await Promise.all(
            props.assets.map(async asset => {
                const file = resolve(asset);
                const form = new FormData() as any;
                form.append('file', createReadStream(file));
                const {alt, url} = await got
                    .post(`${apiBaseUrl}/projects/${apiProjectId}/uploads`, {
                        ...apiOptions,
                        body: form,
                    })
                    .json();

                assetsList.push({alt, url});
            }),
        );
    }

    await got.post(
        `${apiBaseUrl}/projects/${apiProjectId}/repository/tags/${encodedTag}/release`,
        {
            ...apiOptions,
            json: {
                name: `Release: ${props.tag}`,
                tag_name: props.tag,
                description: props.notes,
            },
        },
    );

    if (assetsList.length > 0) {
        await Promise.all(
            assetsList.map(({label, alt, url}: any) => {
                return got.post(
                    `${apiBaseUrl}/projects/${apiProjectId}/releases/${encodedTag}/assets/links`,
                    {
                        ...apiOptions,
                        json: {name: label || alt, url: `${projectUrl}${url}`},
                    },
                );
            }),
        );
    }
};
