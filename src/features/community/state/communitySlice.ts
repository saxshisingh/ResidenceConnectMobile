import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getPosts,
  likePost,
  savePost,
  fetchComments,
  addComment,
  createPost,
  reportPost,
  deletePost,
  Comment,
} from '../services/communityService';
import { Post } from '../services/communityService';

interface PostsState {
  posts: Post[];
  filteredPosts: Post[];
  loading: boolean;
  error: string | null;
  activeFilter: string;

  comments: Comment[];
  commentsLoading: boolean;
}

const initialState: PostsState = {
  posts: [],
  filteredPosts: [],
  loading: false,
  error: null,
  activeFilter: 'All',

  comments: [],
  commentsLoading: false,
};

/* ================= FETCH POSTS ================= */

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async () => {
    return await getPosts();
  },
);

/* ================= LIKE ================= */

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId, userId }: { postId: string; userId: string }) => {
    await likePost(postId, userId);
    return postId;
  },
);

/* ================= SAVE ================= */

export const toggleSave = createAsyncThunk(
  'posts/toggleSave',
  async ({ postId, userId }: { postId: string; userId: string }) => {
    await savePost(postId, userId);
    return postId;
  },
);

/* ================= COMMENTS ================= */

export const getPostComments = createAsyncThunk(
  'posts/getComments',
  async (postId: string) => {
    return await fetchComments(postId);
  },
);

export const addPostComment = createAsyncThunk(
  'posts/addComment',
  async (
    {
      postId,
      commentText,
      userId,
    }: { postId: string; commentText: string; userId: string },
  ) => {
    await addComment(postId, commentText, userId);
    return postId;
  },
);

export const createCommunityPost = createAsyncThunk(
  'posts/createPost',
  async (formData: FormData) => {
    return await createPost(formData);
  },
);

export const reportCommunityPost = createAsyncThunk(
  'posts/reportPost',
  async (
    { postId, reason, reportedBy }: 
    { postId: string; reason: string; reportedBy: string },
  ) => {
    await reportPost(postId, reason, reportedBy);
  },
);

export const deleteCommunityPost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string) => {
    await deletePost(postId);
    return postId;
  },
);



const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.activeFilter = action.payload;

      if (action.payload === 'All') {
        state.filteredPosts = state.posts;
      } else {
        state.filteredPosts = state.posts.filter(
          post => post.postType === action.payload,
        );
      }
    },

    searchPosts: (state, action) => {
      const term = action.payload.toLowerCase();

      if (!term) {
        state.filteredPosts = state.posts;
        return;
      }

      state.filteredPosts = state.posts.filter(
        post =>
          post.title.toLowerCase().includes(term) ||
          post.content.toLowerCase().includes(term) ||
          post.createdByName.toLowerCase().includes(term),
      );
    },
  },

  extraReducers: builder => {
    builder

     
      .addCase(fetchPosts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
        state.filteredPosts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })

     
      .addCase(toggleLike.fulfilled, (state, action) => {
        const postId = action.payload;

        const updatePost = (post: Post) => {
          if (post.postId === postId) {
            post.isLikedByUser = !post.isLikedByUser;
            post.likeCount += post.isLikedByUser ? 1 : -1;
          }
        };

        state.posts.forEach(updatePost);
        state.filteredPosts.forEach(updatePost);
      })

     
      .addCase(toggleSave.fulfilled, (state, action) => {
        const postId = action.payload;

        const updatePost = (post: Post) => {
          if (post.postId === postId) {
            post.isSavedByUser = !post.isSavedByUser;
            post.saveCount += post.isSavedByUser ? 1 : -1;
          }
        };

        state.posts.forEach(updatePost);
        state.filteredPosts.forEach(updatePost);
      })

     
      .addCase(getPostComments.pending, state => {
        state.commentsLoading = true;
      })
      .addCase(getPostComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload;
      })
      .addCase(getPostComments.rejected, state => {
        state.commentsLoading = false;
      })

    
      .addCase(addPostComment.fulfilled, (state, action) => {
        const postId = action.payload;

        state.posts.forEach(post => {
          if (post.postId === postId) {
            post.commentCount += 1;
          }
        });

        state.filteredPosts.forEach(post => {
          if (post.postId === postId) {
            post.commentCount += 1;
          }
        });
      })

      .addCase(deleteCommunityPost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.posts = state.posts.filter(post => post.postId !== postId);
        state.filteredPosts = state.filteredPosts.filter(post => post.postId !== postId);
      });
  },
});

export const { setFilter, searchPosts } = postsSlice.actions;
export default postsSlice.reducer;
