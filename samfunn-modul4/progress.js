'use strict';
const LearningState={
  migrate(saved,version){
    if(saved.quizVersion===version)return saved;
    return {...saved,legacyQuiz:saved.quiz||{},quiz:{},quizVersion:version,quizRevisionNotice:Object.keys(saved.quiz||{}).length>0};
  },
  attempt(previous,selected,correctIndex){
    const old=previous||{};
    const count=old.attempts||0;
    return {selected,correct:selected===correctIndex,attempts:count+1,firstSelected:count?old.firstSelected:selected,firstCorrect:count?old.firstCorrect:selected===correctIndex};
  },
  summary(records){
    return {total:records.length,attempted:records.filter(r=>r?.attempts>0).length,firstCorrect:records.filter(r=>r?.firstCorrect===true).length,correct:records.filter(r=>r?.correct===true).length,corrected:records.filter(r=>r?.correct&&r.attempts>1).length,reviewed:records.length>0&&records.every(r=>r?.attempts>0)};
  }
};
