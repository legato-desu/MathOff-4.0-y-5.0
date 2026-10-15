import { create } from "zustand";

interface ScanImage {
  id: string;
  uri: string;
}

interface ScanStore {

  imagesByUser: {
    [userId: number]: ScanImage[];
  };

  addImage: (
    userId: number,
    uri: string
  ) => void;

  getImages: (
    userId: number
  ) => ScanImage[];

  clearImages: (
    userId: number
  ) => void;
}

export const useScanStore = create<ScanStore>(
  (set, get) => ({

    imagesByUser: {},

    addImage: (
      userId,
      uri
    ) =>

      set((state) => ({

        imagesByUser: {

          ...state.imagesByUser,

          [userId]: [

            {
              id: Date.now().toString(),
              uri,
            },

            ...(state.imagesByUser[userId] || []),
          ],
        },
      })),

    getImages: (userId) => {

      return (
        get().imagesByUser[userId] || []
      );
    },

    clearImages: (userId) =>

      set((state) => ({

        imagesByUser: {

          ...state.imagesByUser,

          [userId]: [],
        },
      })),
  })
);