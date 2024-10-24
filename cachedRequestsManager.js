import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js";


let requestsCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");


global.requestsCaches = [];
global.cachedRequestsCleanerStarted = false;



export default class CachedRequestsManager{
    static add(url, content, ETag= "") {
        if (!cachedRequestsCleanerStarted) {
            cachedRequestsCleanerStarted = true;
            CachedRequestsManager.startCachedRequestsCleaner();
        }
        if (url != "") {
            CachedRequestsManager.clear(url);
            requestsCaches.push({
                url,
                content,
                ETag,
                Expire_Time: utilities.nowInSeconds() + requestsCachesExpirationTime
            });
            console.log(BgWhite + FgBlue, `[Data of ${url} repository has been cached]`);
        }
    }
    static clear(url) {
        if (url != "") {
            let indexToDelete = [];
            let index = 0;
            for (let cache of requestsCaches) {
                if (cache.url == url) indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(requestsCaches, indexToDelete);
        }
    }


    
    static startCachedRequestsCleaner() {

        setInterval(CachedRequestsManager.flushExpired, requestsCachesExpirationTime * 1000);
        console.log(BgWhite + FgBlue, "[Periodic requests data caches cleaning process started...]");
    }

    static find(url) {
        try {
            if (url != "") {
                for (let cache of requestsCaches) {
                    if (cache.url == url) {
                        // renew cache
                        cache.Expire_Time = utilities.nowInSeconds() + requestsCachesExpirationTime;
                        console.log(BgWhite + FgBlue, `[${cache.url} data retrieved from cache]`);
                        return cache.content;
                    }
                }
            }
        } catch (error) {
            console.log(BgWhite + FgRed, "[repository cache error!]", error);
        }
        return null;
    }


    static flushExpired() {
        let now = utilities.nowInSeconds();
        for (let cache of requestsCaches) {
            if (cache.Expire_Time <= now) {
                console.log(BgWhite + FgBlue, "Cached file data of " + cache.model + ".json expired");
            }
        }
        requestsCaches = requestsCaches.filter( cache => cache.Expire_Time > now);
    }
    static get(HttpContext){
        let isInCache = CachedRequestsManager.find(HttpContext.req.url);
        
        if(isInCache != null){
            HttpContext.response.JSON(isInCache.content,isInCache.Etag,true);
            return true;

        }
        else
            return false;
        
    }
    static newETag() {
        ETag = uuidv1();
        return Etag;
    }
     
        
    


}

