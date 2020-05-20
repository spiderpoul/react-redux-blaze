import { useCallback, useEffect } from 'react';
import { buildReducer, ReducerCur } from 'redux-blaze';
import { useDispatch, useSelector } from 'react-redux';

export interface FetcherModel<TModel> {
    data: TModel | null;
    isLoading: boolean;
    error: any;
}

export function createReduxFetcher<TModel, TState>(arg: {
    prefix: string;
    fetcher: (...args: any[]) => Promise<TModel>;
    getState: (state: TState) => FetcherModel<TModel>;
    mutate?: (res: any) => TModel;
}) {
    type InitialState = FetcherModel<TModel>;

    const initialState: InitialState = {
        data: null,
        isLoading: false,
        error: false,
    };

    const { prefix, fetcher, getState, mutate = (s) => s } = arg;

    type Reducer<TPayload> = ReducerCur<InitialState, TPayload>;

    const loadRequest: Reducer<{}> = () => (s) => ({ ...s, isLoading: true });

    const loadSuccess: Reducer<{ data: TModel }> = ({ data }) => (s) => ({
        ...s,
        data,
        isLoading: false,
        error: false,
    });

    const loadError: Reducer<{ error: any }> = ({ error }) => (s) => ({
        ...s,
        error,
        isLoading: false,
    });

    const { bind, actionCreators, reducer } = buildReducer(
        initialState,
        {
            loadRequest,
            loadSuccess,
            loadError,
        },
        { prefix }
    );

    let prefetched = false;

    const fetchData = (...args) => async (dispatch) => {
        const { loadError, loadRequest, loadSuccess } = bind(dispatch);
        loadRequest({});
        try {
            const data = await fetcher(...args);
            loadSuccess({ data: mutate(data) });
        } catch (error) {
            loadError({ error });
        }
    };

    const prefetch = (...args) => (dispatch) => {
        prefetched = true;
        dispatch(fetchData(...args));
    };

    type UseData = FetcherModel<TModel> & {loadData: () => {}}

    const useData = (...args): UseData  => {
        const dispatch = useDispatch();
        const state = useSelector(getState);
        const loadData = useCallback(
            () => dispatch(fetchData(...args)),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [...args, dispatch]
        );

        useEffect(() => {
            if (!prefetched) {
                loadData();
            }
        }, [loadData]);

        return { ...state, loadData };
    };

    return {
        reducer: reducer,
        actions: actionCreators,
        useData,
        fetchData,
        prefetch,
    };
}
