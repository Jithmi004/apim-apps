/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import AccountBox from '@mui/icons-material/AccountBox';
import Grid from '@mui/material/Grid';
import Alert from 'AppComponents/Shared/Alert';
import ConfirmDialog from 'AppComponents/Shared/ConfirmDialog';
import API from 'AppData/api';
import CommentEdit from './CommentEdit';
import CommentOptions from './CommentOptions';
import { injectIntl } from 'react-intl';

const PREFIX = 'CommentReply';

const classes = {
    link: `${PREFIX}-link`,
    commentIcon: `${PREFIX}-commentIcon`,
    commentText: `${PREFIX}-commentText`,
    root: `${PREFIX}-root`,
    contentWrapper: `${PREFIX}-contentWrapper`
};

const StyledConfirmDialog
 = styled(ConfirmDialog
)((
    {
        theme
    }
) => ({
    [`& .${classes.link}`]: {
        color: theme.palette.getContrastText(theme.palette.background.default),
        cursor: 'pointer',
    },

    [`& .${classes.commentIcon}`]: {
        color: theme.palette.getContrastText(theme.palette.background.default),
    },

    [`& .${classes.commentText}`]: {
        color: theme.palette.getContrastText(theme.palette.background.default),
        marginTop: theme.spacing(1),
        width: '100%',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
    },

    [`& .${classes.root}`]: {
        marginTop: theme.spacing(2.5),
    },

    [`& .${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth,
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
    }
}));

/**
 * Display a particular comment and details
 * @class CommentReply
 * @extends {React.Component}
 */
class CommentReply extends React.Component {
    /**
     * Creates an instance of Comment
     * @param {*} props properies passed by the parent element
     * @memberof CommentReply
     */
    constructor(props) {
        super(props);
        this.state = {
            openDialog: false,
            editIndex: -1,
            deleteComment: null,
        };
        this.keyCount = 0;
        this.getKey = this.getKey.bind(this);
        this.handleClickDeleteComment = this.handleClickDeleteComment.bind(this);
        this.handleShowEdit = this.handleShowEdit.bind(this);
        this.handleClickOpen = this.handleClickOpen.bind(this);
        this.showEditComment = this.showEditComment.bind(this);
        this.handleConfirmDialog = this.handleConfirmDialog.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.filterRemainingComments = this.filterRemainingComments.bind(this);
        this.filterCommentToDelete = this.filterCommentToDelete.bind(this);
    }

    /**
     * Genereates unique keys for comments
     * @memberof Comment
     */
    getKey() {
        return this.keyCount++;
    }

    /**
     * Hides the component to edit a comment
     * @param {any} index Index of comment in the array
     * @memberof CommentReply
     */
    handleShowEdit() {
        this.setState({ editIndex: -1 });
    }

    /**
     * Shows the confimation dialog to delete a comment
     * @param {Object} comment Comment that has to be deleted
     * @memberof CommentReply
     */
    handleClickOpen(comment) {
        const { editIndex } = this.state;
        if (editIndex === -1) {
            this.setState({ deleteComment: comment, openDialog: true });
        }
    }

    /**
     * Hides the confimation dialog to delete a comment
     * @memberof CommentReply
     */
    handleClose() {
        this.setState({ openDialog: false });
    }

    /**
     * Handles the Confirm Dialog
     * @param {*} bool properies passed by the Confirm Dialog
     * @memberof CommentReply
     */
    handleConfirmDialog(message) {
        if (message) {
            this.handleClickDeleteComment();
        } else {
            this.handleClose();
        }
    }

    /**
     * Handles deleting a comment
     * @memberof CommentReply
     */
    handleClickDeleteComment() {
        const Api = new API();
        const { deleteComment } = this.state;
        const { api, allComments, commentsUpdate } = this.props;
        const commentIdOfCommentToDelete = deleteComment.commentId;
        const parentCommentIdOfCommentToDelete = deleteComment.parentCommentId;
        const apiId = api.id;
        this.handleClose();

        Api.deleteComment(apiId, commentIdOfCommentToDelete)
            .then(() => {
                if (parentCommentIdOfCommentToDelete === undefined) {
                    const remainingComments = allComments.filter(this.filterRemainingComments);
                    commentsUpdate(remainingComments);
                } else {
                    const index = allComments.findIndex(this.filterCommentToDelete);
                    const remainingReplies = allComments[index].replies.filter(this.filterRemainingComments);
                    allComments[index].replies = remainingReplies;
                    commentsUpdate(allComments);
                }
            })
            .catch((error) => {
                console.error(error);
                if (error.response) {
                    Alert.error(error.response.body.message);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Comments.delete.comment.error',
                        defaultMessage: 'Something went wrong while deleting comment - {commentIdOfCommentToDelete}',
                    },
                    {
                        commentIdOfCommentToDelete,
                    }));
                }
            });
    }

    /**
     * Filters the comments to be remained
     * @memberof CommentReply
     */
    filterRemainingComments(commentToFilter) {
        const { deleteComment } = this.state;
        return commentToFilter.commentId !== deleteComment.commentId;
    }

    /**
     * Filters the comments to be deleted
     * @memberof CommentReply
     */
    filterCommentToDelete(commentToFilter) {
        const { deleteComment } = this.state;
        return commentToFilter.commentId === deleteComment.parentCommentId;
    }

    /**
     * Shows the component to edit a comment
     * @param {any} index Index of comment in the array
     * @memberof CommentReply
     */
    showEditComment(index) {
        const { editIndex } = this.state;
        if (editIndex === -1) {
            this.setState({ editIndex: index });
        }
    }

    /**
     * Render method of the component
     * @returns {React.Component} Comment html component
     * @memberof CommentReply
     */
    render() {
        const {
            classes, comments, api, allComments, commentsUpdate, intl
        } = this.props;
        const { editIndex, openDialog } = this.state;
        const props = { api, allComments, commentsUpdate };
        return [
            comments
                && comments.map((comment, index) => (
                    <div key={this.getKey()} className={classes.contentWrapper}>
                        <Grid container spacing={2} className={classes.root}>
                            <Grid item>
                                <AccountBox className={classes.commentIcon} />
                            </Grid>
                            <Grid item xs zeroMinWidth>
                                <Typography noWrap className={classes.commentText} variant='body1'>
                                    {comment.createdBy}
                                </Typography>

                                {index !== editIndex && (
                                    <Typography className={classes.commentText}>{comment.commentText}</Typography>
                                )}

                                {index === editIndex && (
                                    <CommentEdit {...props} comment={comment} toggleShowEdit={this.handleShowEdit} />
                                )}
                                <CommentOptions
                                    classes={classes}
                                    comment={comment}
                                    editIndex={editIndex}
                                    index={index}
                                    showAddComment={this.showAddComment}
                                    handleClickOpen={this.handleClickOpen}
                                    showEditComment={this.showEditComment}
                                />
                            </Grid>
                        </Grid>
                    </div>
                )),
            <ConfirmDialog
                key='key-dialog'
                labelCancel={intl.formatMessage({
                    id: 'Apis.Details.Comments.Comment.delete.confirm.cancel.label',
                    defaultMessage: 'Cancel',
                })}
                title={intl.formatMessage({
                    id: 'Apis.Details.Comments.Comment.delete.confirm.title',
                    defaultMessage: 'Confirm Delete',
                })}
                message={intl.formatMessage({
                    id: 'Apis.Details.Comments.Comment.delete.confirm',
                    defaultMessage: 'Are you sure you want to delete this comment?',
                })}
                labelOk={intl.formatMessage({
                    id: 'Apis.Details.Comments.Comment.delete.confirm.yes.label',
                    defaultMessage: 'Yes',
                })}
                callback={this.handleConfirmDialog}
                open={openDialog}
            />,
        ];
    }
}

CommentReply.defaultProps = {
    api: null,
};

CommentReply.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    api: PropTypes.instanceOf(Object),
    allComments: PropTypes.instanceOf(Array).isRequired,
    commentsUpdate: PropTypes.func.isRequired,
    comments: PropTypes.instanceOf(Array).isRequired,
};

export default injectIntl(CommentReply);
