import { TFRecordsImageMessage, Features, Feature, FeatureList,
    BytesList, Int64List, FloatList } from "./tensorFlowRecordsProtoBuf_pb";
import { crc32c, maskCrc, getInt64Buffer, getInt32Buffer, textEncode, readInt64 } from "./tensorFlowHelpers";

/**
 * @name - TFRecords Read Class
 * @description - Read a TFRecords object
 */
export class TFRecordsReader {
    private imageMessages: TFRecordsImageMessage[];

    constructor(tfrecords: Buffer) {
        try {
            this.imageMessages = [];
            let position = 0;

            while (position < tfrecords.length) {
                const lengthBuffer = tfrecords.slice(position, position + 8);
                const dataLength = readInt64(lengthBuffer, 0);
                const lengthCrc = maskCrc(crc32c(lengthBuffer));
                position += 8;

                const expectedLengthCrc = tfrecords.readInt32LE(position);
                position += 4;

                if (lengthCrc !== expectedLengthCrc) {
                    console.log("Wrong Length CRC");
                    break;
                }

                const dataBuffer = tfrecords.slice(position, position + dataLength);
                const dataCrc = maskCrc(crc32c(dataBuffer));
                position += dataLength;

                const expectedDataCrc = tfrecords.readInt32LE(position);
                position += 4;

                if (dataCrc !== expectedDataCrc) {
                    console.log("Wrong Data CRC");
                    break;
                }

                // Deserialize TFRecord from dataBuffer
                const imageMessage: TFRecordsImageMessage = TFRecordsImageMessage.deserializeBinary(dataBuffer);

                this.imageMessages.push(imageMessage);
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * @description - Return the number of TFRecords read
     */
    public length(): number {
        return this.imageMessages.length;
    }

    /**
     * @description - Return the TFRecords in a JSON Object Array format
     */
    public toJSON(): object {
        return [];
    }
}
