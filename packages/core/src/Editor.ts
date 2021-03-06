import { NativeTypes } from 'react-dnd-html5-backend';
import { Middleware, Store } from 'redux';
import { v4 } from 'uuid';
import { actions, ActionsTypes } from './actions';
import { isProduction } from './const';
import { selectors } from './selector';
import PluginService from './service/plugin';
import {
  ContentPluginConfig,
  LayoutPluginConfig,
  Plugins,
} from './service/plugin/classes';
import pluginDefault from './service/plugin/default';
import createStore from './store';
import { EditableType } from './types/editable';
import { RootState } from './types/state';
import { setLang } from './actions/setting';

const initialState = ({ lang }) => ({
  reactPage: {
    settings: {
      lang,
    },
    editables: {
      past: [],
      present: [],
      future: [],
    },
  },
});

const nativeTypes = (editor: Editor) =>
  editor.plugins.hasNativePlugin()
    ? [NativeTypes.URL, NativeTypes.FILE, NativeTypes.TEXT]
    : [];

const update = (editor: Editor) => (editable: EditableType) => {
  const state = editor.plugins.unserialize(editable);
  actions(editor.store.dispatch).editable.update({
    ...state,
    config: {
      plugins: editor.plugins,
      whitelist: [
        ...editor.plugins.getRegisteredNames(),
        ...nativeTypes(editor),
      ],
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

export type Languages = Array<{
  lang: string;
  label: string;
}>;
export interface CoreEditorProps<T extends RootState = RootState> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: Plugins;
  middleware?: [];
  editables?: EditableType[];
  defaultPlugin?: ContentPluginConfig | LayoutPluginConfig;

  store?: Store<T>;
  languages?: Languages;
  lang?: string;
}

/**
 * Editor is the core interface for dealing with the editor.
 */
class Editor<T extends RootState = RootState> {
  store: Store<RootState>;
  plugins: PluginService;
  middleware: Middleware[];

  defaultPlugin: ContentPluginConfig | LayoutPluginConfig;

  trigger: ActionsTypes;
  query = {};
  languages?: Languages;

  constructor({
    plugins,
    middleware = [],
    editables = [],
    defaultPlugin = pluginDefault,
    store,
    languages = [],
    lang,
  }: CoreEditorProps<T> = {}) {
    this.store =
      store ||
      createStore(initialState({ lang: lang || languages[0] }), middleware);
    this.plugins = new PluginService(plugins);
    this.middleware = middleware;
    this.trigger = actions(this.store.dispatch);
    this.query = selectors(this.store);
    this.defaultPlugin = defaultPlugin;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.trigger.editable.add = update(this) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.trigger.editable.update = update(this) as any;

    this.languages = languages;
    if (languages?.length > 0) {
      console.warn('setting languages is an experimental feature');
    }

    editables.forEach(this.trigger.editable.add);
  }

  public setLang(lang: string) {
    this.store.dispatch(setLang(lang));
  }

  public refreshEditables = () => {
    this.store.getState().reactPage.editables.present?.forEach((editable) => {
      if (!isProduction) {
        // tslint:disable-next-line:no-console
        console.log(this.plugins.serialize(editable));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.trigger.editable.update(this.plugins.serialize(editable));
    });
  };

  /**
   * @deprecated in order to reduce the api surface, we will remove this method in the future
   */
  public setLayoutPlugins = (plugins: LayoutPluginConfig[] = []) => {
    console.warn(
      'in order to reduce the api surface, we will remove setLayoutPlugins in the future'
    );
    this.plugins.setLayoutPlugins(plugins);
    this.refreshEditables();
  };
  /**
   * @deprecated in order to reduce the api surface, we will remove this method in the future
   */
  public addLayoutPlugin = (config: LayoutPluginConfig) => {
    console.warn(
      'in order to reduce the api surface, we will remove addLayoutPlugin in the future'
    );
    this.plugins.addLayoutPlugin(config);
    this.refreshEditables();
  };
  /**
   * @deprecated in order to reduce the api surface, we will remove this method in the future
   */
  public removeLayoutPlugin = (name: string) => {
    console.warn(
      'in order to reduce the api surface, we will remove removeLayoutPlugin in the future'
    );
    this.plugins.removeLayoutPlugin(name);
    this.refreshEditables();
  };
  /**
   * @deprecated in order to reduce the api surface, we will remove this method in the future
   */
  public setContentPlugins = (plugins: ContentPluginConfig[] = []) => {
    console.warn(
      'in order to reduce the api surface, we will remove setContentPlugins in the future'
    );
    this.plugins.setContentPlugins(plugins);
    this.refreshEditables();
  };

  /**
   * @deprecated in order to reduce the api surface, we will remove this method in the future
   */
  public addContentPlugin = (config: ContentPluginConfig) => {
    console.warn(
      'in order to reduce the api surface, we will remove addContentPlugin in the future'
    );
    this.plugins.addContentPlugin(config);
    this.refreshEditables();
  };

  /**
   * @deprecated in order to reduce the api surface, we will remove this method in the future
   */
  public removeContentPlugin = (name: string) => {
    console.warn(
      'in order to reduce the api surface, we will remove removeContentPlugin in the future'
    );
    this.plugins.removeContentPlugin(name);
    this.refreshEditables();
  };
}

export const createEmptyState: () => EditableType = () =>
  ({ id: v4(), cells: [] } as EditableType);

export default Editor;
