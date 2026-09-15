import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FavoritesContext } from "./favoritesContextStore";
import { AuthContext } from "../auth/authContextStore";
import {
  canUseCloudUserData,
  getCloudFavorites,
  saveCloudFavorites,
} from "../../services/userDataService";

const FAVORITES_STORAGE_KEY = "nexomarket-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const firebaseUser = auth?.firebaseUser ?? null;
  const isLoading = auth?.isLoading ?? false;
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const hydratedKey = useRef<string | null>(null);
  const storageKey = firebaseUser
    ? `${FAVORITES_STORAGE_KEY}-${firebaseUser.uid}`
    : null;

  useEffect(() => {
    if (isLoading) return;
    hydratedKey.current = null;
    let isActive = true;
    async function loadFavorites() {
      let nextFavoriteIds: string[] = [];
      try {
        const cloudFavorites =
          canUseCloudUserData && firebaseUser
            ? await getCloudFavorites(firebaseUser.uid)
            : null;
        if (cloudFavorites) nextFavoriteIds = cloudFavorites;
        else if (storageKey) {
          const savedFavorites = localStorage.getItem(storageKey);
          const parsedFavorites = savedFavorites
            ? JSON.parse(savedFavorites)
            : [];
          nextFavoriteIds = Array.isArray(parsedFavorites)
            ? parsedFavorites.filter(
                (id): id is string => typeof id === "string",
              )
            : [];
        }
      } catch {
        if (storageKey) localStorage.removeItem(storageKey);
      }
      if (!isActive) return;
      setFavoriteIds(nextFavoriteIds);
      hydratedKey.current = storageKey;
    }
    void loadFavorites();
    return () => {
      isActive = false;
    };
  }, [firebaseUser, isLoading, storageKey]);

  useEffect(() => {
    if (storageKey && hydratedKey.current === storageKey)
      localStorage.setItem(storageKey, JSON.stringify(favoriteIds));
    if (
      canUseCloudUserData &&
      firebaseUser &&
      hydratedKey.current === storageKey
    )
      void saveCloudFavorites(firebaseUser.uid, favoriteIds).catch(
        () => undefined,
      );
  }, [favoriteIds, firebaseUser, storageKey]);

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavorite: (productId: string) => favoriteIds.includes(productId),
      toggleFavorite: (productId: string) =>
        setFavoriteIds((current) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId],
        ),
    }),
    [favoriteIds],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
