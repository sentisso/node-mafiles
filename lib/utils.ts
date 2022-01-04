import read, {Options} from "read";

export function readPromise(options: Options): Promise<{err: any, result: string}> {
    return new Promise(resolve => {
        read(options, function(err: any, result: string) {
            resolve({err, result})
        })
    })
}
