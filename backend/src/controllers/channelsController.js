// Create a new channel
export const createChannels = (req, res) => {
    // STEP 1: get team ID (where channel will be created)
        // const teamID = req ...

    // STEP 2: check if user is admin?
    
    // STEP 3: get channel info
        // const channelName = req ...

    // STEP 4: create a new channel object with info and save to database 
}

// Add users to a channel
export const addUsersToChannel = (req, res) => {
    // STEP 1: get channel ID (where users will be added)

    // STEP 2: check if user is admin?

    // STEP 3: check if desired user is part of the TEAM
        // if yes, proceed. if no, keep prompting

    // STEP 4: check if desired user is part of the CHANNEL
        // if no, procees. if yes, keep prompting

    // STEP 4: push user to channel database
}