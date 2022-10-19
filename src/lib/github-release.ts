import got from 'got';
import {basename} from 'path';
import {createFileForm} from './gitlab-release';

/**
 * The options that you can apply to creating a release with Github
 */
interface GithubReleaseProps {
    /**
     * The tag name you want to create the release against. This tag must
     * already be pushed to the remote
     */
    tag: string;
    /**
     * The release notes that will be added to the release. Theses can be in
     * markdown format.
     */
    notes: string;
    /**
     * The host for the Github API. This will generally be `api.github.com`
     * unless you are using Enterprise Github
     */
    host: string;
    /**
     * The username or org and the project name for example
     * `Practically/Preloader`
     */
    project: string;
    /**
     * Your Github secret that will give you access to the API
     */
    secret: string;
    /**
     * A list of asset file to upload and link to the release
     */
    assets: string[];
}

/**
 * Create a new release against a tag. If there is files that need to be
 * attached to the release then these will be uploaded and linked to the release
 *
 * See: https://docs.github.com/en/rest/reference/releases#create-a-release
 * See: https://docs.github.com/en/rest/reference/releases#upload-a-release-asset
 */
export const githubRelease = async (props: GithubReleaseProps) => {
    const apiBaseUrl = `https://${props.host}`;
    const apiOptions = {
        headers: {Authorization: `token ${props.secret}`},
    };

    const {id} = await got
        .post(`${apiBaseUrl}/repos/${props.project}/releases`, {
            ...apiOptions,
            json: {
                name: `Release: ${props.tag}`,
                tag_name: props.tag,
                body: props.notes || 'No release notes.',
            },
        })
        .json<{id: string}>();

    if (props.assets.length > 0) {
        const assetUrl = apiBaseUrl.replace('api.', 'uploads.');
        await Promise.all(
            props.assets.map(asset => {
                const name = basename(asset);
                return got.post(
                    `${assetUrl}/repos/${props.project}/releases/${id}/assets?name=${name}`,
                    {
                        ...apiOptions,
                        body: createFileForm(asset),
                    },
                );
            }),
        );
    }
};
