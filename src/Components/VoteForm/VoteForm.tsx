import React, { FC } from 'react';
import { Button, Input, Table, Typography } from 'antd';

import { CandidateType } from '../../types/types';

interface IConnectionStatus {
  account: string | null;
  candidates: CandidateType[] | null;
  remainingTime: string | number;
  number: number | string; // default value ""
  onChangeNumber: (value: number) => void;
  voteFunction: () => void;
  canVote: boolean;
  isTimeRemaining: boolean
}

const columns = [
  { title: 'Index', dataIndex: 'index', key: 'index' },
  { title: 'Candidate name', dataIndex: 'name', key: 'name' },
  { title: 'Candidate votes', dataIndex: 'voteCount', key: 'voteCount' }
];

const VoteForm: FC<IConnectionStatus> = (props) => {
  const { account, candidates, remainingTime, number, onChangeNumber, voteFunction, canVote, isTimeRemaining } = props;

  if (!isTimeRemaining && account) {
    return <Typography.Title level={5}>Voting is finished!</Typography.Title>;
  }
  const candidateLength = (candidates?.length ?? 1);
  const disabledSubmit = number > candidateLength || number < 0 || (!number && number !== 0);

  return (
    <div className="form">
      {account && <Typography.Title level={5}>Metamask account: {account}</Typography.Title>}
      {
        canVote
          ? (
              <div className="field-container">
                {account && canVote && <Typography.Title level={5}>Remaining time: {remainingTime}</Typography.Title>}
                <div className="field">
                  <Input
                    placeholder="Enter candidate index"
                    type="number"
                    value={number}
                    onChange={(e) => onChangeNumber(Number(e.target.value))}
                  />
                  <Button disabled={disabledSubmit} type="primary" onClick={voteFunction}>Vote</Button>
                </div>
              </div>
            )
          : (
              <Typography>You have already voted!</Typography>
            )
      }
      <Table columns={columns} dataSource={candidates ?? []} pagination={false} size="small" />
    </div>
  );
};

export default VoteForm;
