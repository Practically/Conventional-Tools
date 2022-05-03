import {createReadStream} from 'fs';
import {resolve} from 'path';
import * as FormData from 'form-data';
const got = require('got');

export interface gitlabReleaseProps {
    tag: string;
    assets: string[];
    notes: string;
    provider: string;
    host: string;
    project: string;
    secret: string;
}

export const createFileForm = (file_path: string): FormData => {
    const file = resolve(file_path);
    const form_data = new FormData() as any;
    form_data.append('file', createReadStream(file));

    return form_data;
};

export const gitlabRelease = async (props: gitlabReleaseProps) => {
    const assetsList: any = [];
    const apiBaseUrl = `https://${props.host}/api/v4`;
    const apiProjectId = encodeURIComponent(props.project);
    const projectUrl = `https://${props.host}/${props.project}`;
    const apiOptions = {headers: {'PRIVATE-TOKEN': props.secret}};
    const encodedTag = encodeURIComponent(props.tag);

    // Remote a release. Handy for testing
    // await got.delete(`${apiBaseUrl}/projects/${apiProjectId}/releases/${encodedTag}`, {...apiOptions});
    // return;

    if (props.assets.length > 0) {
        await Promise.all(
            props.assets.map(async asset => {
                const {alt, url} = await got
                    .post(`${apiBaseUrl}/projects/${apiProjectId}/uploads`, {
                        ...apiOptions,
                        body: createFileForm(asset),
                    })
                    .json();

                assetsList.push({alt, url});
            }),
        );
    }

    await got.post(`${apiBaseUrl}/projects/${apiProjectId}/releases`, {
        ...apiOptions,
        json: {
            name: `Release: ${props.tag}`,
            tag_name: props.tag,
            description: props.notes || 'No release notes.',
        },
    });

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
