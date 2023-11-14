import "./styles.css";
import * as React from "react";

type UserDetailsResponse = {
  name: string;
  email: string;
  avatarUrl: string;
  __type: "UserDetailsResponse";
};

type DetailsResponses = UserDetailsResponse;

type KindOfDetailsResponse = DetailsResponses["__type"];

const Loader = () => <>Loading</>;

type ImageProps = {
  src: string;
  alt: string;
};
// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
const Image = (props: ImageProps) => <img {...props} />;

const UserDetailsWrapper = ({ children }: React.PropsWithChildren) => (
  <div>{children}</div>
);

type UserDetailsTextComponentProps = {
  name: string;
  email: string;
};
const UserDetailsTextComponent = <T extends UserDetailsTextComponentProps>(
  props: T
) => (
  <>
    <h2>{props.name}</h2>
    <p>{props.email}</p>
  </>
);

type UserDetails = {
  name: string;
  email: string;
  avatarUrl: string;
};

type UserDetailsProps = {
  details: UserDetails;
  AvatarComponent: React.FunctionComponent<ImageProps>;
  UserDetailsComponent: React.FunctionComponent<UserDetailsTextComponentProps>;
};

const UserDetails = ({ details, AvatarComponent }: UserDetailsProps) => (
  <>
    <UserDetailsTextComponent {...details} />
    <AvatarComponent src={details.avatarUrl} alt="User Avatar" />
  </>
);

type HttpAPIResponse<T> =
  | { kind: "success"; data: T }
  | { kind: "error"; error: string }
  | { kind: "404" };

const fetchUserDetails = (
  userId: string
): Promise<HttpAPIResponse<UserDetailsResponse>> =>
  new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          kind: "success",
          data: {
            name: "Cat",
            email: "cat@mittens.meow",
            avatarUrl: "https://placekitten.com/100/100",
            __type: "UserDetailsResponse"
          }
        }),
      100
    );
  });

const Components: Record<
  KindOfDetailsResponse,
  (v: { data: DetailsResponses }) => React.ReactElement
> = {
  UserDetailsResponse: (v) => (
    <UserDetails
      details={v.data}
      UserDetailsComponent={UserDetailsTextComponent}
      AvatarComponent={Image}
    />
  )
};

type UserProfileProps = {
  userId: string;
};
type UserProfileState<T> = {
  isLoading: boolean;
  data: T | null;
  error?: string;
};
const initialState: UserProfileState<UserDetailsResponse> = {
  isLoading: false,
  data: null
};
const useUserProfileState = ({ userId }: UserProfileProps) => {
  const [state, setUserDetails] = React.useState(() => initialState);

  const fetchUserDataHandler = React.useCallback(() => {
    async function getDetails() {
      const res = await fetchUserDetails(userId);

      if (res.kind === "404") {
        return setUserDetails((p) => ({
          ...p,
          isLoading: false,
          data: null,
          error: "Not Found"
        }));
      }

      if (res.kind === "error") {
        return setUserDetails((p) => ({
          ...p,
          isLoading: false,
          data: null,
          error: res.error
        }));
      }

      if (res.kind === "success") {
        return setUserDetails((p) => ({ ...p, data: res.data }));
      }
    }

    getDetails();
  }, [userId]);

  React.useEffect(fetchUserDataHandler, [fetchUserDataHandler]);

  const Component = React.useMemo(
    () => (state.data ? Components[state.data.__type] : null),
    [state]
  );

  return { state, Component } as const;
};

const UserProfile = (props: UserProfileProps) => {
  const { state, Component } = useUserProfileState(props);

  // Loader
  if (state.isLoading) {
    return (
      <UserDetailsWrapper>
        <Loader />
      </UserDetailsWrapper>
    );
  }

  if (state.error || !state.data) {
    return <UserDetailsWrapper>{state.error}</UserDetailsWrapper>;
  }

  return (
    <UserDetailsWrapper>
      {Component && Component({ data: state.data })}
    </UserDetailsWrapper>
  );
};

export default function App() {
  return (
    <div className="App">
      <UserProfile userId="123" />
    </div>
  );
}
