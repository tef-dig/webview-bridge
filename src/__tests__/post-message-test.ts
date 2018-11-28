import '../post-message';
import {
    isWebViewBridgeAvailable,
    postMessageToNativeApp,
} from '../post-message';
import {
    createFakeAndroidPostMessage,
    removeFakeAndroidPostMessage,
    createFakeWebKitPostMessage,
    removeFakeWebKitPostMessage,
} from './fake-post-message';

const ANY_STRING = 'any-string';
const ANY_CODE = '432';

afterEach(() => {
    removeFakeWebKitPostMessage();
    removeFakeAndroidPostMessage();
});

test('web bridge is installed', () => {
    expect(typeof window.__tuenti_webview_bridge!.postMessage).toBe('function');
});

test('webview bridge unavailable', () => {
    expect(isWebViewBridgeAvailable()).toBe(false);
});

test('android webview  bridge availability', () => {
    createFakeAndroidPostMessage();

    expect(isWebViewBridgeAvailable()).toBe(true);
});

test('webkit webview  bridge availability', () => {
    createFakeWebKitPostMessage();

    expect(isWebViewBridgeAvailable()).toBe(true);
});

test('post message to native app: no bridge', async cb => {
    expect(isWebViewBridgeAvailable()).toBe(false);

    postMessageToNativeApp({id: '1', type: 'PAGE_LOADED'}).catch(err => {
        expect(err.code).toBe(500);
        cb();
    });
});

test('post message to native app: error received', async cb => {
    createFakeAndroidPostMessage({
        getResponse: msg => ({
            id: msg.id,
            type: 'ERROR',
            payload: {code: ANY_CODE, reason: ANY_STRING},
        }),
    });

    postMessageToNativeApp({id: '1', type: 'PAGE_LOADED'}).catch(err => {
        expect(err.code).toBe(ANY_CODE);
        cb();
    });
});

test('post message to native app: bad response type', async cb => {
    createFakeAndroidPostMessage({
        getResponse: msg => ({
            id: msg.id,
            type: 'OTHER_TYPE',
            payload: {code: ANY_CODE, reason: ANY_STRING},
        }),
    });

    postMessageToNativeApp({id: '1', type: 'PAGE_LOADED'}).catch(err => {
        expect(err.code).toBe(500);
        cb();
    });
});

test('post message to native app: bad response type', async cb => {
    createFakeWebKitPostMessage({
        getResponse: msg => ({
            id: msg.id,
            type: 'OTHER_TYPE',
            payload: {code: ANY_CODE, reason: ANY_STRING},
        }),
    });

    postMessageToNativeApp({id: '1', type: 'PAGE_LOADED'}).catch(err => {
        expect(err.code).toBe(500);
        cb();
    });
});

test('malformed json throws', () => {
    expect(() => {
        window.__tuenti_webview_bridge!.postMessage('{bad;json}');
    }).toThrow();
});
