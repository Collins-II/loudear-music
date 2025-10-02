import { Types } from "mongoose";
import { Song, ISong } from "@/lib/database/models/song";
import { Album, IAlbum } from "@/lib/database/models/album";
import { Video, IVideo } from "@/lib/database/models/video";

export type MediaType = "song" | "album" | "video";

function serializeDoc(doc: any) {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id.toString(),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
    releaseDate: doc.releaseDate?.toISOString(),
  };
}

export const getMediaById = async (id: string, type: MediaType) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid MongoDB ObjectId");

  let doc: ISong | IAlbum | IVideo | null = null;

  switch (type) {
    case "song":
      doc = await Song.findById(id).lean({ virtuals: true }).exec();
      break;
    case "album":
      doc = await Album.findById(id)
        .populate("songs")
        .lean({ virtuals: true })
        .exec();
      break;
    case "video":
      doc = await Video.findById(id).lean({ virtuals: true }).exec();
      break;
    default:
      throw new Error(`Unsupported media type: ${type}`);
  }

  return serializeDoc(doc);
};
