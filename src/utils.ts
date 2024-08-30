class TokenHistoryEntry
{
  constructor(iteration: number, tokens: any) {
    this.iteration = iteration;
    this.tokens = tokens;
    
  }
  iteration: number;
  tokens: any;
}


class TokenHistory 
{
  tokenHistory: TokenHistoryEntry[] = [];

  add(tokenHistoryEntry: TokenHistoryEntry) {
    this.tokenHistory.push(tokenHistoryEntry)
  }

  getMetabolite(metaboliteName: string): number[] { 
    var tokens: number[] = [];
    for(var historyEntry of this.tokenHistory) {
      var t = historyEntry.tokens;
      var metab = t.filter((obj: any) => obj.label == metaboliteName)
      
      if(metab.length == 0) {
        console.log("ERROR: METABOLITE NOT FOUND")
      }
      tokens.push(metab[0].tokens)
    }
    return tokens
  }
}
export { TokenHistoryEntry, TokenHistory};
